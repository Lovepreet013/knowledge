from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer
from .parsers import extract_text
from rest_framework.exceptions import ValidationError
from .models import Document, DocumentChunk
from .chunking import chunk_text
from .embeddings import get_embeddings_batch
from rest_framework.exceptions import PermissionDenied, ValidationError


# Create your views here.
class DocumentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(
            company=self.request.user.company  # type: ignore
        )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return DocumentUploadSerializer
        return DocumentSerializer

    def perform_create(self, serializer):
        if self.request.user.company is None:  # type: ignore
            raise ValidationError("You must belong to a company to upload documents.")

        if self.request.user.role != "company_admin":  # type: ignore
            raise PermissionDenied("Only company admins can upload documents.")

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


class DocumentDetailView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DocumentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "superadmin":  # type: ignore
            return Document.objects.all()  # superadmin reaches across all companies
        return Document.objects.filter(company=user.company)  # type: ignore  # everyone else stays tenant-scoped

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role not in ("company_admin", "superadmin"):  # type: ignore
            raise PermissionDenied(
                "You do not have permission to delete this document."
            )
        instance.delete()
