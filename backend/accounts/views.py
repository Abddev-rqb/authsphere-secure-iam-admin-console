from rest_framework import serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from audit.models import AuditLog
from iam.models import UserSession


def get_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0]
    return request.META.get("REMOTE_ADDR")


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"detail": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        UserSession.objects.create(
            user=user,
            ip_address=get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
        )

        AuditLog.objects.create(
            actor=user,
            action="LOGIN",
            resource="Authentication",
            description=f"{user.username} logged in",
            ip_address=get_client_ip(request),
        )

        roles = [
            {
                "id": user_role.role.id,
                "name": user_role.role.name,
                "permissions": [
                    permission.codename
                    for permission in user_role.role.permissions.all()
                ],
            }
            for user_role in user.iam_roles.select_related("role").prefetch_related("role__permissions")
        ]

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                    "roles": roles,
                },
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        AuditLog.objects.create(
            actor=request.user,
            action="LOGOUT",
            resource="Authentication",
            description=f"{request.user.username} logged out",
            ip_address=get_client_ip(request),
        )

        return Response(
            {"detail": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        roles = [
            {
                "id": user_role.role.id,
                "name": user_role.role.name,
                "permissions": [
                    permission.codename
                    for permission in user_role.role.permissions.all()
                ],
            }
            for user_role in user.iam_roles.select_related("role").prefetch_related("role__permissions")
        ]

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "roles": roles,
            }
        )
