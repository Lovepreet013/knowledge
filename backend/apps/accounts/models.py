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
    # Stable Google identifier (ID token `sub` claim). Never use email as ID:
    # a Google account can change emails over time, `sub` never is reused.
    google_sub = models.CharField(
        max_length=255, unique=True, null=True, blank=True, db_index=True
    )
    # Stable Auth0 identifier (Auth0 ID token `sub`, e.g. "google-oauth2|...").
    # Same rule: `sub` is stable, email is not.
    auth0_sub = models.CharField(
        max_length=255, unique=True, null=True, blank=True, db_index=True
    )

    def __str__(self):
        return self.username
