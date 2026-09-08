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
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
