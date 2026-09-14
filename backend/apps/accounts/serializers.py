from rest_framework import serializers
from apps.companies.models import Company
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    invite_code = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True, allow_blank=False, max_length=150)
    last_name = serializers.CharField(
        required=False, allow_blank=True, max_length=150, default=""
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "password",
            "invite_code",
            "first_name",
            "last_name",
        ]

    def validate_invite_code(self, value):
        try:
            self.company = Company.objects.get(invite_code=value, is_active=True)
        except Company.DoesNotExist:
            raise serializers.ValidationError("Invalid invite code.")
        return value

    def create(self, validated_data):
        validated_data.pop("invite_code")
        password = validated_data.pop("password")
        user = User(**validated_data, company=self.company, role="user")
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "company", "company_name", "is_active"]
        read_only_fields = [
            "id",
            "email",
            "username",
            "role",
            "company",
            "company_name",
        ]  # only is_active is editable

    def get_company_name(self, obj):
        return obj.company.name if obj.company else None
