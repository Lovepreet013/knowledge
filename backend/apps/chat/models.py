from django.db import models
from apps.companies.models import Company
from apps.accounts.models import User


# Create your models here.
class Conversation(models.Model):
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="conversations"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="conversations"
    )
    title = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title or f"Conversation {self.id}"  # type: ignore


class Message(models.Model):
    ROLE_CHOICES = [("user", "User"), ("assistant", "Assistant")]

    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    sources = models.JSONField(
        default=list, blank=True
    )  # Store sources as a JSON array
    # Persistent per-message attachment (replaces the old ephemeral-only flow).
    # The original upload is kept on disk so the chat bubble can show a
    # thumbnail / file pill on reload, and follow-up questions in the same
    # conversation can reuse it. Only user messages carry attachments.
    attachment = models.FileField(
        upload_to="chat_attachments/%Y/%m", null=True, blank=True
    )
    attachment_thumbnail = models.ImageField(
        upload_to="chat_attachments/thumbs/%Y/%m", null=True, blank=True
    )  # small JPEG for images only — the "little thumbnail" shown in chat
    attachment_name = models.CharField(max_length=255, blank=True, default="")
    attachment_kind = models.CharField(
        max_length=10, blank=True, default=""
    )  # 'image' | 'pdf' | 'txt'
    attachment_text = models.TextField(
        blank=True, default=""
    )  # extracted text for pdf/txt, reused by follow-up questions
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
