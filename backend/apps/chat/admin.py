from django.contrib import admin
from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ["role", "content", "sources", "created_at"]
    can_delete = False


class ConversationAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "company", "user", "created_at"]
    list_display_links = ["id", "title"]
    list_filter = ["company"]
    search_fields = ["title", "user__username", "company__name"]
    inlines = [MessageInline]


class MessageAdmin(admin.ModelAdmin):
    list_display = ["id", "conversation", "role", "short_content", "created_at"]
    list_display_links = ["id", "short_content"]
    list_filter = ["role", "conversation__company"]
    search_fields = ["content"]
    readonly_fields = ["sources", "created_at"]

    def short_content(self, obj):
        return obj.content[:60] + "..." if len(obj.content) > 60 else obj.content

    short_content.short_description = "Content"


admin.site.register(Conversation, ConversationAdmin)
admin.site.register(Message, MessageAdmin)
