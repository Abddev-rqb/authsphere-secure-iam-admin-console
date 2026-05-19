import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from iam.models import Permission, Role, APIKey, UserSession


@pytest.fixture
def admin_user():
    return User.objects.create_user(
        username="admin",
        email="admin@authsphere.dev",
        password="Admin@12345",
        is_staff=True,
        is_superuser=True,
    )


@pytest.fixture
def authenticated_client(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


@pytest.mark.django_db
def test_admin_can_create_permission(authenticated_client):
    response = authenticated_client.post(
        "/api/iam/permissions/",
        {
            "name": "View Users",
            "codename": "users.view",
            "description": "Can view users",
        },
        format="json",
    )

    assert response.status_code == 201
    assert Permission.objects.filter(codename="users.view").exists()


@pytest.mark.django_db
def test_admin_can_create_role_with_permissions(authenticated_client):
    permission = Permission.objects.create(
        name="View Users",
        codename="users.view",
        description="Can view users",
    )

    response = authenticated_client.post(
        "/api/iam/roles/",
        {
            "name": "Security Analyst",
            "description": "Read-only security role",
            "permission_ids": [permission.id],
        },
        format="json",
    )

    assert response.status_code == 201
    assert Role.objects.filter(name="Security Analyst").exists()
    assert response.data["permissions"][0]["codename"] == "users.view"


@pytest.mark.django_db
def test_admin_can_create_user(authenticated_client):
    response = authenticated_client.post(
        "/api/iam/users/",
        {
            "username": "developer",
            "email": "developer@authsphere.dev",
            "first_name": "API",
            "last_name": "Developer",
            "password": "Developer@12345",
            "is_staff": False,
            "role_ids": [],
        },
        format="json",
    )

    assert response.status_code == 201
    assert User.objects.filter(username="developer").exists()


@pytest.mark.django_db
def test_admin_can_create_api_key(authenticated_client, admin_user):
    response = authenticated_client.post(
        "/api/iam/api-keys/",
        {
            "name": "Internal Dashboard API",
            "user": admin_user.id,
        },
        format="json",
    )

    assert response.status_code == 201
    assert APIKey.objects.filter(name="Internal Dashboard API").exists()
    assert response.data["key"]


@pytest.mark.django_db
def test_admin_can_revoke_api_key(authenticated_client, admin_user):
    api_key = APIKey.objects.create(
        name="Internal Dashboard API",
        user=admin_user,
    )

    response = authenticated_client.post(
        f"/api/iam/api-keys/{api_key.id}/revoke/",
        format="json",
    )

    api_key.refresh_from_db()

    assert response.status_code == 200
    assert api_key.is_active is False
    assert api_key.revoked_at is not None


@pytest.mark.django_db
def test_admin_can_revoke_session(authenticated_client, admin_user):
    session = UserSession.objects.create(
        user=admin_user,
        ip_address="127.0.0.1",
        user_agent="pytest",
    )

    response = authenticated_client.post(
        f"/api/iam/sessions/{session.id}/revoke/",
        format="json",
    )

    session.refresh_from_db()

    assert response.status_code == 200
    assert session.is_active is False
