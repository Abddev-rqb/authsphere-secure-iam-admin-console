from django.contrib import admin
from .models import Permission, Role, UserRole, APIKey, UserSession


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "codename", "created_at")
    search_fields = ("name", "codename")


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    search_fields = ("name",)
    filter_horizontal = ("permissions",)


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "role", "assigned_at")
    search_fields = ("user__username", "role__name")


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "user", "is_active", "created_at", "revoked_at")
    search_fields = ("name", "user__username")
    list_filter = ("is_active",)


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "ip_address", "is_active", "created_at", "last_seen_at")
    search_fields = ("user__username", "ip_address")
    list_filter = ("is_active",)
