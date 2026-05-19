from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet,
    PermissionViewSet,
    RoleViewSet,
    APIKeyViewSet,
    UserSessionViewSet,
)

router = DefaultRouter()
router.register("users", UserViewSet, basename="users")
router.register("permissions", PermissionViewSet, basename="permissions")
router.register("roles", RoleViewSet, basename="roles")
router.register("api-keys", APIKeyViewSet, basename="api-keys")
router.register("sessions", UserSessionViewSet, basename="sessions")

urlpatterns = [
    path("", include(router.urls)),
]
