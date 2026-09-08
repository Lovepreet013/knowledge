from django.db import models
from apps.companies.models import Company
from apps.accounts.models import User


# Create your models here.
class Document(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("ready", "Ready"),
        ("failed", "Failed"),
    ]

    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="documents"
    )
    uploaded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="uploaded_documents"
    )
    file = models.FileField(upload_to="documents/%Y/%m")
    file_type = models.CharField(max_length=10)  # pdf, txt, csv
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    error_message = models.TextField(blank=True, null=True)
    extracted_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file.name} - {self.company.name} - {self.status}"


class DocumentChunk(models.Model):
    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, related_name="chunks"
    )
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE
    )  # denormalized — enables direct filtering without joining through Document
    content = models.TextField()
    chunk_index = models.IntegerField()
    embedding = models.JSONField(
        null=True, blank=True
    )  # filled in the next stage — empty for now
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["chunk_index"]

    def __str__(self):
        return f"{self.document.file.name} — chunk {self.chunk_index}"
