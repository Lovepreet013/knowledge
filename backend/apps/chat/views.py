import json
from django.http import StreamingHttpResponse
from rest_framework import generics, permissions
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
    generate_answer_stream,
)
from .attachments import build_thumbnail_file, load_stored_image_for_gemini, process_upload


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
        conversation = self._get_conversation(request, conversation_id)
        messages = conversation.messages.all()
        return Response(MessageSerializer(messages, many=True).data)

    def _build_context(self, request, conversation):
        """
        Shared setup used by both the synchronous and streaming message
        endpoints: saves the user's message (+ attachment/thumbnail if any),
        gathers history attachments per the reuse rules, and resolves the
        chunks/attachments/images to hand to Gemini.
        """
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question = serializer.validated_data["content"]
        upload = serializer.validated_data.get("file")

        current_name = None
        current_ranked_text = ""
        current_image = None
        user_message = Message(conversation=conversation, role="user", content=question)

        if upload is not None:
            current_name, kind, extracted, image_bytes, mime = process_upload(upload)
            user_message.attachment_name = current_name
            user_message.attachment_kind = kind
            if kind in ("pdf", "txt"):
                user_message.attachment_text = extracted
                current_ranked_text = build_attachment_context(current_name, extracted, question)
            else:
                user_message.attachment_text = ""
                current_ranked_text = ""
                current_image = (image_bytes, mime or "image/jpeg")
            user_message.save()
            try:
                upload.seek(0)
            except Exception:
                pass
            user_message.attachment.save(current_name, upload, save=True)
            if current_image is not None:
                try:
                    thumb_file = build_thumbnail_file(current_name, current_image[0])
                    user_message.attachment_thumbnail.save(thumb_file.name, thumb_file, save=True)
                except Exception:
                    pass
        else:
            user_message.save()

        history_attachments: list[tuple[str, str]] = []
        history_images: list[tuple[bytes, str]] = []
        include_history = (current_name is None) or _question_refers_to_history(question)
        if include_history:
            try:
                prior = list(
                    Message.objects.filter(conversation=conversation, role="user")
                    .exclude(id=user_message.id)
                    .exclude(attachment__isnull=True)
                    .exclude(attachment="")
                    .order_by("-created_at", "-id")[:10]
                )
            except Exception:
                prior = []
            prior.reverse()
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
                        loaded = load_stored_image_for_gemini(msg.attachment) if msg.attachment else None
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

        current_attachments = [(current_name, current_ranked_text)] if current_name else []
        current_images = [current_image] if current_image is not None else []
        all_attachments = history_attachments + current_attachments
        all_images = history_images + current_images
        current_names = {current_name} if current_name else None

        chunks = retrieve_relevant_chunks(question, conversation.company_id)

        return {
            "question": question,
            "chunks": chunks,
            "attachments": all_attachments,
            "images": all_images,
            "current_names": current_names,
        }

    def _build_sources(self, chunks, all_attachments, used_filenames):
        sources = []
        seen_documents = set()
        for chunk in chunks:
            filename = chunk.document.file.name
            if filename in used_filenames and chunk.document_id not in seen_documents:
                seen_documents.add(chunk.document_id)
                sources.append({"document_id": chunk.document_id, "document_name": filename, "origin": "company"})
        seen_attachment_names = set()
        for name, _text in all_attachments:
            if not name or name in seen_attachment_names:
                continue
            seen_attachment_names.add(name)
            if f"{name}{ATTACHMENT_SUFFIX}" in used_filenames:
                sources.append({"document_id": None, "document_name": name, "origin": "attachment"})
        return sources

    def post(self, request, conversation_id):
        conversation = self._get_conversation(request, conversation_id)
        ctx = self._build_context(request, conversation)

        answer_text, used_filenames = generate_answer(
            ctx["question"], ctx["chunks"],
            attachments=ctx["attachments"] or None,
            images=ctx["images"] or None,
            current_names=ctx["current_names"],
        )

        sources = self._build_sources(ctx["chunks"], ctx["attachments"], used_filenames)

        assistant_message = Message.objects.create(
            conversation=conversation, role="assistant", content=answer_text, sources=sources
        )
        return Response(MessageSerializer(assistant_message).data, status=201)

    def _get_conversation(self, request, conversation_id):
        try:
            return Conversation.objects.get(
                id=conversation_id, user=request.user, company=request.user.company
            )
        except Conversation.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Conversation not found.")


class MessageStreamView(MessageListCreateView):
    """
    Same behavior/contract as MessageListCreateView.post — attachment
    handling, history reuse, tenant isolation — all inherited via
    _build_context/_build_sources. Only the generation step differs:
    tokens are streamed to the client via SSE instead of returned as one
    JSON response once Gemini finishes.
    """

    def post(self, request, conversation_id):
        conversation = self._get_conversation(request, conversation_id)
        ctx = self._build_context(request, conversation)

        def event_stream():
            final_answer = ""
            final_filenames = []

            for event in generate_answer_stream(
                ctx["question"], ctx["chunks"],
                attachments=ctx["attachments"] or None,
                images=ctx["images"] or None,
                current_names=ctx["current_names"],
            ):
                if event.get("done"):
                    final_answer = event["answer_text"]
                    final_filenames = event["used_filenames"]
                    break
                yield f"data: {json.dumps({'token': event['token']})}\n\n"

            sources = self._build_sources(ctx["chunks"], ctx["attachments"], final_filenames)

            Message.objects.create(
                conversation=conversation, role="assistant", content=final_answer, sources=sources
            )

            yield f"data: {json.dumps({'done': True, 'sources': sources})}\n\n"

        response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response