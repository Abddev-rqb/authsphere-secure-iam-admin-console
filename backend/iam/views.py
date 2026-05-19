from django.contrib.auth.models import User
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from audit.models import AuditLog
from .models import Permission, Role, UserRole, APIKey, UserSession
from .serializers import (
    PermissionSerializer,
    RoleSerializer,
    UserSerializer,
    UserCreateSerializer,
    UserRoleSerializer,
    APIKeySerializer,
    APIKeyCreateSerializer,
    UserSessionSerializer,
)


def get_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0]
    return request.META.get("REMOTE_ADDR")


def create_audit_log(request, action, resource, description=""):
    AuditLog.objects.create(
        actor=request.user if request.user.is_authenticated else None,
        action=action,
        resource=resource,
        description=description,
        ip_address=get_client_ip(request),
    )


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.prefetch_related("iam_roles__role__permissions").all().order_by("-date_joined")
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering_fields = ["id", "username", "email", "date_joined"]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        create_audit_log(
            self.request,
            "CREATE",
            "User",
            f"Created user {user.username}",
        )

    def perform_update(self, serializer):
        user = serializer.save()
        create_audit_log(
            self.request,
            "UPDATE",
            "User",
            f"Updated user {user.username}",
        )

    def perform_destroy(self, instance):
        username = instance.username
        instance.delete()
        create_audit_log(
            self.request,
            "DELETE",
            "User",
            f"Deleted user {username}",
        )

    @action(detail=True, methods=["post"], url_path="assign-role")
    def assign_role(self, request, pk=None):
        user = self.get_object()
        serializer = UserRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        role = serializer.validated_data["role"]
        user_role, created = UserRole.objects.get_or_create(user=user, role=role)

        if created:
            create_audit_log(
                request,
                "CREATE",
                "UserRole",
                f"Assigned role {role.name} to {user.username}",
            )

        return Response(UserRoleSerializer(user_role).data, status=status.HTTP_201_CREATED)


class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "codename", "description"]
    ordering_fields = ["id", "name", "created_at"]

    def perform_create(self, serializer):
        permission = serializer.save()
        create_audit_log(
            self.request,
            "CREATE",
            "Permission",
            f"Created permission {permission.codename}",
        )

    def perform_update(self, serializer):
        permission = serializer.save()
        create_audit_log(
            self.request,
            "UPDATE",
            "Permission",
            f"Updated permission {permission.codename}",
        )

    def perform_destroy(self, instance):
        codename = instance.codename
        instance.delete()
        create_audit_log(
            self.request,
            "DELETE",
            "Permission",
            f"Deleted permission {codename}",
        )


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.prefetch_related("permissions").all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["id", "name", "created_at"]

    def perform_create(self, serializer):
        role = serializer.save()
        create_audit_log(
            self.request,
            "CREATE",
            "Role",
            f"Created role {role.name}",
        )

    def perform_update(self, serializer):
        role = serializer.save()
        create_audit_log(
            self.request,
            "UPDATE",
            "Role",
            f"Updated role {role.name}",
        )

    def perform_destroy(self, instance):
        role_name = instance.name
        instance.delete()
        create_audit_log(
            self.request,
            "DELETE",
            "Role",
            f"Deleted role {role_name}",
        )


class APIKeyViewSet(viewsets.ModelViewSet):
    queryset = APIKey.objects.select_related("user").all()
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "user__username"]
    ordering_fields = ["id", "name", "created_at", "is_active"]

    def get_serializer_class(self):
        if self.action == "create":
            return APIKeyCreateSerializer
        return APIKeySerializer

    def perform_create(self, serializer):
        api_key = serializer.save()
        create_audit_log(
            self.request,
            "CREATE",
            "APIKey",
            f"Generated API key {api_key.name}",
        )

    @action(detail=True, methods=["post"], url_path="revoke")
    def revoke(self, request, pk=None):
        api_key = self.get_object()

        if not api_key.is_active:
            return Response(
                {"detail": "API key is already revoked."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        api_key.revoke()

        create_audit_log(
            request,
            "REVOKE",
            "APIKey",
            f"Revoked API key {api_key.name}",
        )

        return Response(
            {"detail": "API key revoked successfully."},
            status=status.HTTP_200_OK,
        )


class UserSessionViewSet(viewsets.ModelViewSet):
    queryset = UserSession.objects.select_related("user").all()
    serializer_class = UserSessionSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["user__username", "ip_address", "user_agent"]
    ordering_fields = ["id", "created_at", "last_seen_at", "is_active"]

    @action(detail=True, methods=["post"], url_path="revoke")
    def revoke(self, request, pk=None):
        user_session = self.get_object()

        if not user_session.is_active:
            return Response(
                {"detail": "Session is already inactive."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_session.is_active = False
        user_session.save(update_fields=["is_active"])

        create_audit_log(
            request,
            "REVOKE",
            "UserSession",
            f"Revoked session for {user_session.user.username}",
        )

        return Response(
            {"detail": "Session revoked successfully."},
            status=status.HTTP_200_OK,
        )
