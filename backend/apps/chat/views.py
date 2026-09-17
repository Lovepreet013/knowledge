from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    MessageSerializer,
    SendMessageSerializer,
)
from .rag import (
    ATTACHMENT_SUFFIX,
    MAX_HISTORY_IMAGES,
    MAX_HISTORY_TEXT_ATTACHMENTS,
    build_attachment_context,
    retrieve_relevant_chunks,
    generate_answer,
)
from .attachments import (
    build_thumbnail_file,
    load_stored_image_for_gemini,
    process_upload,
)


# Create your views here.
class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user).order_by(
            "-created_at", "-id"
        )

    def perform_create(self, serializer):
        if self.request.user.company is None:  # type: ignore
            raise ValidationError(
                "You must belong to a company to start a conversation."
            )
        serializer.save(user=self.request.user, company=self.request.user.company)  # type: ignore


class ConversationDetailView(generics.UpdateAPIView):
    """Rename a conversation (e.g. first question replaces "New chat")."""

    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = "conversation_id"

    def get_queryset(self):
        # Same tenant + ownership isolation as message access.
        return Conversation.objects.filter(
            user=self.request.user, company=self.request.user.company  # type: ignore
        )


def _question_refers_to_history(question: str) -> bool:
    """True when a question with a new upload explicitly wants older files.

    "Explain the image" with a fresh upload must answer the CURRENT file
    only. History is included with a new upload only for explicit signals
    like previous/earlier/compare/both/all, otherwise it drowns the current
    file and reproduces the reported bug.
    """
    q = (question or "").lower()
    markers = (
        "previous",
        "previously",
        "earlier",
        "prior",
        "first image",
        "first file",
        "last image",
        "last file",
        "other image",
        "other file",
        "another image",
        "another file",
        "both image",
        "both file",
        "both of",
        "all image",
        "all file",
        "compare",
        "comparison",
        "combined",
        "together",
    )
    return any(m in q for m in markers)


class MessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, conversation_id):
        conversation = self._get_conversation(request, conversation_id)  # type: ignore
        messages = conversation.messages.all()  # type: ignore
        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request, conversation_id):
        conversation = self._get_conversation(request, conversation_id)

        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question = serializer.validated_data["content"]
        upload = serializer.validated_data.get("file")

        # Persistent attachment: validated in RAM, then stored on the user
        # Message (`attachment` + little `attachment_thumbnail` for images)
        # so the bubble keeps its thumbnail/file pill on reload. The stored
        # text/image is also reused for follow-up questions below.
        current_name: str | None = None
        current_ranked_text = ""
        current_image: tuple[bytes, str] | None = None
        user_message = Message(
            conversation=conversation, role="user", content=question
        )
        if upload is not None:
            current_name, kind, extracted, image_bytes, mime = process_upload(
                upload
            )
            user_message.attachment_name = current_name
            user_message.attachment_kind = kind
            if kind in ("pdf", "txt"):
                # Keep the full extraction for future questions; rank a
                # snippet for this question's prompt.
                user_message.attachment_text = extracted
                current_ranked_text = build_attachment_context(
                    current_name, extracted, question
                )
            else:
                user_message.attachment_text = ""
                current_ranked_text = ""
                current_image = (image_bytes, mime or "image/jpeg")  # type: ignore
            # Save first so FileFields have an instance, then store files.
            user_message.save()
            try:
                upload.seek(0)
            except Exception:
                pass
            user_message.attachment.save(current_name, upload, save=True)
            if current_image is not None:
                try:
                    thumb_file = build_thumbnail_file(
                        current_name, current_image[0]
                    )
                    user_message.attachment_thumbnail.save(
                        thumb_file.name, thumb_file, save=True
                    )
                except Exception:
                    # Thumbnail is display-only: keep the original file and
                    # continue rather than failing the question.
                    pass
        else:
            user_message.save()

        # Follow-up reuse: prior attachments stay in context ONLY when
        # needed. Pure follow-ups (no new upload) reuse history as before.
        # With a new upload, default to CURRENT-only so "Explain the image"
        # explains the just-uploaded file; include history only when the
        # question explicitly refers to previous/earlier/compare/both/all.
        # Tenant isolation holds because the queryset is scoped to this
        # conversation (already scoped to user + company).
        history_attachments: list[tuple[str, str]] = []
        history_images: list[tuple[bytes, str]] = []
        include_history = (current_name is None) or _question_refers_to_history(
            question
        )
        if include_history:
            try:
                prior = list(
                    Message.objects.filter(
                        conversation=conversation, role="user"
                    )
                    .exclude(id=user_message.id)
                    .exclude(attachment__isnull=True)
                    .exclude(attachment="")
                    .order_by("-created_at", "-id")[:10]
                )
            except Exception:
                prior = []
            prior.reverse()  # chronological: history first, current last
            text_count = 0
            image_count = 0
            for msg in prior:
                name = (msg.attachment_name or "").strip()
                if not name:
                    continue
                kind = (msg.attachment_kind or "").strip()
                if kind == "image":
                    if image_count >= MAX_HISTORY_IMAGES:
                        continue
                    try:
                        loaded = (
                            load_stored_image_for_gemini(msg.attachment)
                            if msg.attachment
                            else None
                        )
                    except Exception:
                        loaded = None
                    if loaded is None:
                        continue
                    history_images.append(loaded)
                    history_attachments.append((name, ""))
                    image_count += 1
                elif kind in ("pdf", "txt"):
                    if text_count >= MAX_HISTORY_TEXT_ATTACHMENTS:
                        continue
                    stored_text = msg.attachment_text or ""
                    if not stored_text.strip():
                        continue
                    try:
                        ranked = build_attachment_context(name, stored_text, question)
                    except Exception:
                        continue
                    if not ranked.strip():
                        continue
                    history_attachments.append((name, ranked))
                    text_count += 1
                # unknown kinds are ignored (forward-compatible)

        current_attachments: list[tuple[str, str]] = (
            [(current_name, current_ranked_text)] if current_name else []
        )
        current_images: list[tuple[bytes, str]] = (
            [current_image] if current_image is not None else []
        )
        all_attachments = history_attachments + current_attachments
        all_images = history_images + current_images
        current_names = {current_name} if current_name else None

        chunks = retrieve_relevant_chunks(question, conversation.company_id)
        answer_text, used_filenames = generate_answer(
            question,
            chunks,
            attachments=all_attachments or None,
            images=all_images or None,
            current_names=current_names,
        )

        # only include chunks whose document filename was actually cited by the model
        sources = []
        seen_documents = set()
        for chunk in chunks:
            filename = chunk.document.file.name
            if filename in used_filenames and chunk.document_id not in seen_documents:
                seen_documents.add(chunk.document_id)
                sources.append({
                    "document_id": chunk.document_id,
                    "document_name": filename,
                    "origin": "company",
                })
        seen_attachment_names: set[str] = set()
        for name, _text in all_attachments:
            if not name or name in seen_attachment_names:
                continue
            seen_attachment_names.add(name)
            if f"{name}{ATTACHMENT_SUFFIX}" in used_filenames:
                sources.append({
                    "document_id": None,
                    "document_name": name,
                    "origin": "attachment",
                })

        assistant_message = Message.objects.create(
            conversation=conversation, role="assistant", content=answer_text, sources=sources
        )

        return Response(MessageSerializer(assistant_message).data, status=201)

    def _get_conversation(self, request, conversation_id):
        try:
            # tenant + ownership isolation together — a conversation belongs to
            # a specific company AND a specific user
            return Conversation.objects.get(
                id=conversation_id, user=request.user, company=request.user.company
            )
        except Conversation.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound("Conversation not found.")
