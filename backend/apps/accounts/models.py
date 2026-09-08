from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = [
        ("superadmin", "Superadmin"),
        ("company_admin", "Company Admin"),
        ("user", "User"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")
    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="users",
    )

    def __str__(self):
        return self.username
