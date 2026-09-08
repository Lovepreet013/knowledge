from django.db import models
import secrets


# Create your models here.
class Company(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    invite_code = models.CharField(
        max_length=20, unique=True, default=secrets.token_urlsafe(8), editable=False
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.invite_code:
            self.invite_code = secrets.token_urlsafe(8)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
