from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "slug", "invite_code", "is_active", "created_at"]
        read_only_fields = ["invite_code", "is_active", "created_at"]
