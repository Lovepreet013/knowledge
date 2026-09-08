from django.contrib import admin
from .models import Document
from .models import Document, DocumentChunk


class DocumentAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "file",
        "file_type",
        "company",
        "uploaded_by",
        "status",
        "created_at",
    ]
    list_display_links = ["id", "file"]
    list_filter = ["status", "file_type", "company"]
    search_fields = ["file", "company__name", "uploaded_by__username"]
    readonly_fields = ["extracted_text", "created_at"]


class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = ["id", "document", "chunk_index", "company", "created_at"]
    list_display_links = ["id", "document"]  # add this line
    list_filter = ["company"]
    search_fields = ["content"]
    readonly_fields = ["content", "embedding", "created_at"]


admin.site.register(Document, DocumentAdmin)
admin.site.register(DocumentChunk, DocumentChunkAdmin)
