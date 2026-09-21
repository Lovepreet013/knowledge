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


class GoogleAuthSerializer(serializers.Serializer):
    """ID-token flow: frontend GIS credential + optional invite code.

    `invite_code` is required only for brand-new Google users (to assign
    their company). Returning users / link-by-email logins ignore it so
    `company`/`role` are never overwritten on link.
    """

    id_token = serializers.CharField(required=True, allow_blank=False)
    invite_code = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, default=""
    )


class Auth0AuthSerializer(serializers.Serializer):
    """ID-token flow via Auth0 (e.g. Google connection) + optional invite code.

    Same contract as Google: `invite_code` is required only for brand-new
    users (login never sends one — a missing code then means "no account
    for this email, go register").
    """

    id_token = serializers.CharField(required=True, allow_blank=False)
    invite_code = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, default=""
    )


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
