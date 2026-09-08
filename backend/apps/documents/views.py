from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer
from .parsers import extract_text
from rest_framework.exceptions import ValidationError
from .models import Document, DocumentChunk
from .chunking import chunk_text
from .embeddings import get_embeddings_batch


# Create your views here.
class DocumentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(
            company=self.request.user.company  # type: ignore
        )  # pyright: ignore[reportAttributeAccessIssue]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return DocumentUploadSerializer
        return DocumentSerializer

    def perform_create(self, serializer):
        if self.request.user.company is None:  # type: ignore
            raise ValidationError("You must belong to a company to upload documents.")

        document = serializer.save(
            company=self.request.user.company,  # type: ignore
            uploaded_by=self.request.user,
            status="processing",
        )

        try:
            text = extract_text(document.file, document.file_type)
            document.extracted_text = text

            chunks = chunk_text(text)
            embeddings = get_embeddings_batch(chunks)

            DocumentChunk.objects.bulk_create(
                [
                    DocumentChunk(
                        document=document,
                        company=document.company,
                        content=chunk,
                        chunk_index=i,
                        embedding=embedding,
                    )
                    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
                ]
            )

            document.status = "ready"
            document.save()
        except Exception as e:
            document.status = "failed"
            document.error_message = str(e)
            document.save()
