from django.contrib import admin
from .models import Company


class CompanyAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "slug", "invite_code", "is_active", "created_at"]
    list_display_links = ["id", "name"]
    list_filter = ["is_active"]
    search_fields = ["name", "slug"]
    readonly_fields = ["invite_code", "created_at"]


admin.site.register(Company, CompanyAdmin)
