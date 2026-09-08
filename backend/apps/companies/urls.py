from django.urls import path
from .views import (
    CompanyDetailView,
    CompanyListCreateView,
    CompanyUserListView,
    CompanyUserUpdateView,
    PromoteUserView,
)

urlpatterns = [
    path("", CompanyListCreateView.as_view()),
    path("promote/<int:user_id>/", PromoteUserView.as_view()),
    path("users/", CompanyUserListView.as_view()),
    path("users/<int:pk>/", CompanyUserUpdateView.as_view()),
    path("<int:pk>/", CompanyDetailView.as_view()),
]
