import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from audit.models import AuditLog


@pytest.mark.django_db
def test_admin_can_view_audit_logs():
    admin_user = User.objects.create_user(
        username="admin",
        email="admin@authsphere.dev",
        password="Admin@12345",
        is_staff=True,
        is_superuser=True,
    )

    AuditLog.objects.create(
        actor=admin_user,
        action="LOGIN",
        resource="Authentication",
        description="admin logged in",
        ip_address="127.0.0.1",
    )

    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.get("/api/audit/logs/")

    assert response.status_code == 200
    assert response.data[0]["action"] == "LOGIN"
    assert response.data[0]["resource"] == "Authentication"


@pytest.mark.django_db
def test_non_authenticated_user_cannot_view_audit_logs():
    client = APIClient()

    response = client.get("/api/audit/logs/")

    assert response.status_code == 401
