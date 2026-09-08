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
from .rag import retrieve_relevant_chunks, generate_answer


# Create your views here.
class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.company is None:  # type: ignore
            raise ValidationError(
                "You must belong to a company to start a conversation."
            )
        serializer.save(user=self.request.user, company=self.request.user.company)  # type: ignore


class MessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, conversation_id):
        conversation = self._get_conversation(request, conversation_id)  # type: ignore
        messages = conversation.messages.all()  # type: ignore
        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request, conversation_id):
        conversation = self._get_conversation(request, conversation_id)  # type: ignore

        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question = serializer.validated_data["content"]  # type: ignore

        # save the user's message first
        Message.objects.create(conversation=conversation, role="user", content=question)

        # the actual RAG pipeline
        chunks = retrieve_relevant_chunks(question, conversation.company_id)  # type: ignore
        answer = generate_answer(question, chunks)

        seen_documents = set()
        sources = []
        for chunk in chunks:
            if chunk.document_id not in seen_documents:  # type: ignore
                seen_documents.add(chunk.document_id)  # type: ignore
                sources.append(
                    {
                        "document_id": chunk.document_id,  # type: ignore
                        "document_name": chunk.document.file.name,
                    }
                )

        assistant_message = Message.objects.create(
            conversation=conversation, role="assistant", content=answer, sources=sources
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
