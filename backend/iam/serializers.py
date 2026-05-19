from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Permission, Role, UserRole, APIKey, UserSession


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ["id", "name", "codename", "description", "created_at"]
        read_only_fields = ["id", "created_at"]


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Permission.objects.all(),
        source="permissions",
        write_only=True,
        required=False,
    )

    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "description",
            "permissions",
            "permission_ids",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class UserRoleSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        source="role",
        write_only=True,
    )

    class Meta:
        model = UserRole
        fields = ["id", "role", "role_id", "assigned_at"]
        read_only_fields = ["id", "assigned_at"]


class UserSerializer(serializers.ModelSerializer):
    iam_roles = UserRoleSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
            "iam_roles",
        ]
        read_only_fields = ["id", "date_joined", "is_superuser"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Role.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "is_active",
            "is_staff",
            "role_ids",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        roles = validated_data.pop("role_ids", [])
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        for role in roles:
            UserRole.objects.create(user=user, role=role)

        return user


class APIKeySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = APIKey
        fields = [
            "id",
            "name",
            "key",
            "user",
            "username",
            "is_active",
            "created_at",
            "revoked_at",
        ]
        read_only_fields = ["id", "key", "is_active", "created_at", "revoked_at"]


class APIKeyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ["id", "name", "key", "user", "created_at"]
        read_only_fields = ["id", "key", "created_at"]


class UserSessionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = UserSession
        fields = [
            "id",
            "user",
            "username",
            "ip_address",
            "user_agent",
            "is_active",
            "created_at",
            "last_seen_at",
        ]
        read_only_fields = ["id", "created_at", "last_seen_at"]
