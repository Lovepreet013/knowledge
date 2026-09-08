from rest_framework import serializers
from apps.companies.models import Company
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    invite_code = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "username", "password", "invite_code"]

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
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "company", "is_active"]
        read_only_fields = [
            "id",
            "email",
            "username",
            "role",
            "company",
        ]  # only is_active is editable
