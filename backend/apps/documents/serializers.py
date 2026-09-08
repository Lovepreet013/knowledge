from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            "id",
            "file",
            "file_type",
            "status",
            "error_message",
            "created_at",
        ]
        read_only_fields = ["status", "error_message", "created_at"]


class DocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["file", "file_type"]
