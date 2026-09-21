from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import Auth0LoginView, GoogleLoginView, RegisterView, MeView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("google/", GoogleLoginView.as_view(), name="google_login"),
    path("auth0/", Auth0LoginView.as_view(), name="auth0_login"),
    path("me/", MeView.as_view(), name="me"),
]
