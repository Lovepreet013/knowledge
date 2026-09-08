from django.urls import path
from .views import CompanyListCreateView, PromoteUserView

urlpatterns = [
    path("", CompanyListCreateView.as_view()),
    path("promote/<int:user_id>/", PromoteUserView.as_view()),
]
