from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.accounts.models import User
from .models import Company
from .serializers import CompanySerializer
from .permissions import IsSuperAdmin


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
