from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("id", "actor", "action", "resource", "ip_address", "created_at")
    search_fields = ("actor__username", "action", "resource", "description")
    list_filter = ("action", "created_at")
