from rest_framework import serializers
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "role",
            "content",
            "sources",
            "attachment",
            "attachment_thumbnail",
            "attachment_name",
            "attachment_kind",
            "created_at",
        ]
        read_only_fields = [
            "attachment",
            "attachment_thumbnail",
            "attachment_name",
            "attachment_kind",
        ]


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ["id", "title", "created_at"]


class SendMessageSerializer(serializers.Serializer):
    content = serializers.CharField()
    file = serializers.FileField(required=False)
