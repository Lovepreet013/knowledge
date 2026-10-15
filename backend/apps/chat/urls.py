from django.urls import path
from .views import (
    ConversationDetailView,
    ConversationListCreateView,
    MessageListCreateView,
    MessageStreamView
)

urlpatterns = [
    path("", ConversationListCreateView.as_view(), name="conversation-list-create"),
    path(
        "<int:conversation_id>/",
        ConversationDetailView.as_view(),
        name="conversation-detail",
    ),
    path(
        "<int:conversation_id>/messages/",
        MessageListCreateView.as_view(),
        name="message-list-create",
    ),
    path("<int:conversation_id>/messages/stream/", MessageStreamView.as_view()),
]
