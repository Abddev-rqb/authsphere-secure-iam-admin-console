import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_admin_login_returns_jwt_tokens():
    User.objects.create_user(
        username="admin",
        email="admin@authsphere.dev",
        password="Admin@12345",
        is_staff=True,
        is_superuser=True,
    )

    client = APIClient()

    response = client.post(
        "/api/auth/login/",
        {
            "username": "admin",
            "password": "Admin@12345",
        },
        format="json",
    )

    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data
    assert response.data["user"]["username"] == "admin"


@pytest.mark.django_db
def test_login_rejects_invalid_credentials():
    User.objects.create_user(
        username="admin",
        password="Admin@12345",
    )

    client = APIClient()

    response = client.post(
        "/api/auth/login/",
        {
            "username": "admin",
            "password": "WrongPassword",
        },
        format="json",
    )

    assert response.status_code == 401
    assert response.data["detail"] == "Invalid username or password."


@pytest.mark.django_db
def test_current_user_requires_authentication():
    client = APIClient()

    response = client.get("/api/auth/me/")

    assert response.status_code == 401
