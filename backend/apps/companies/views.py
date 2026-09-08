from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.accounts.models import User
from .models import Company
from .serializers import CompanySerializer
from .permissions import IsSuperAdmin
from rest_framework.exceptions import PermissionDenied
from apps.accounts.serializers import UserSerializer


class CompanyListCreateView(generics.ListCreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsSuperAdmin]


class PromoteUserView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)

        user.role = "company_admin"
        user.save()
        return Response({"id": user.id, "username": user.username, "role": user.role})  # type: ignore


class CompanyUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]  # type: ignore

    def get_queryset(self):
        user = self.request.user
        if user.role != "company_admin":  # type: ignore
            raise PermissionDenied("Only company admins can view company users.")
        return User.objects.filter(company=user.company)  # type: ignore


class CompanyUserUpdateView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]  # type: ignore
    http_method_names = [
        "patch"
    ]  # only allow partial updates, not full PUT replacement

    def get_queryset(self):
        user = self.request.user
        if user.role != "company_admin":  # type: ignore
            raise PermissionDenied("Only company admins can manage users.")
        # critical: only users in THEIR OWN company, never cross-tenant
        return User.objects.filter(company=user.company)  # type: ignore


class CompanyDetailView(generics.DestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsSuperAdmin]
