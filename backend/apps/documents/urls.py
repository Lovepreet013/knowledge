from django.urls import path
from .views import DocumentDetailView, DocumentListCreateView

urlpatterns = [
    path("", DocumentListCreateView.as_view()),
    path("<int:pk>/", DocumentDetailView.as_view()),
]
