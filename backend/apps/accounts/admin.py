from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


class UserAdmin(BaseUserAdmin):
    list_display = [
        "id",
        "username",
        "email",
        "role",
        "company",
        "is_active",
        "date_joined",
    ]
    list_display_links = ["id", "username"]
    list_filter = ["role", "is_active", "company"]
    search_fields = ["username", "email"]

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Company Knowledge AI", {"fields": ("role", "company")}),
    )  # type: ignore


admin.site.register(User, UserAdmin)
