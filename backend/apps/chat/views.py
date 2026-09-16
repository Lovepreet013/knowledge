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
    build_attachment_context,
    retrieve_relevant_chunks,
    generate_answer,
)
from .attachments import process_upload


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

        # Ephemeral attachment (MVP): validated + extracted in RAM per
        # question, discarded with the request. Only the filename survives,
        # inside the assistant message's sources.
        attachment_name = None
        attachment_text = ""
        image_data = None
        if upload is not None:
            attachment_name, extracted, image_bytes, mime = process_upload(upload)
            if image_bytes is not None:
                image_data = (image_bytes, mime or "image/jpeg")
            else:
                attachment_text = build_attachment_context(
                    attachment_name, extracted, question
                )

        Message.objects.create(conversation=conversation, role="user", content=question)

        chunks = retrieve_relevant_chunks(question, conversation.company_id)
        answer_text, used_filenames = generate_answer(
            question,
            chunks,
            attachment=(attachment_name, attachment_text) if attachment_name else None,
            image_data=image_data,
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
        if attachment_name and f"{attachment_name}{ATTACHMENT_SUFFIX}" in used_filenames:
            sources.append({
                "document_id": None,
                "document_name": attachment_name,
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
