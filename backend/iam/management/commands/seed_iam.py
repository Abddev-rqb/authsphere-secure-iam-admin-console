from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from iam.models import Permission, Role, UserRole, APIKey
from audit.models import AuditLog


class Command(BaseCommand):
    help = "Seed IAM permissions, roles, demo users, API keys, and audit logs"

    def handle(self, *args, **options):
        permission_data = [
            ("View Users", "users.view", "Can view user records"),
            ("Create Users", "users.create", "Can create users"),
            ("Update Users", "users.update", "Can update users"),
            ("Delete Users", "users.delete", "Can delete users"),
            ("View Roles", "roles.view", "Can view roles"),
            ("Create Roles", "roles.create", "Can create roles"),
            ("Update Roles", "roles.update", "Can update roles"),
            ("Delete Roles", "roles.delete", "Can delete roles"),
            ("View Permissions", "permissions.view", "Can view permissions"),
            ("Manage API Keys", "api_keys.manage", "Can generate and revoke API keys"),
            ("View Sessions", "sessions.view", "Can view sessions"),
            ("Revoke Sessions", "sessions.revoke", "Can revoke sessions"),
            ("View Audit Logs", "audit_logs.view", "Can view audit logs"),
        ]

        permissions = {}

        for name, codename, description in permission_data:
            permission, _ = Permission.objects.get_or_create(
                codename=codename,
                defaults={
                    "name": name,
                    "description": description,
                },
            )
            permissions[codename] = permission

        admin_role, _ = Role.objects.get_or_create(
            name="IAM Admin",
            defaults={
                "description": "Full access to IAM administration features.",
            },
        )
        admin_role.permissions.set(permissions.values())

        security_analyst_role, _ = Role.objects.get_or_create(
            name="Security Analyst",
            defaults={
                "description": "Read-only access to security monitoring and audit data.",
            },
        )
        security_analyst_role.permissions.set(
            [
                permissions["users.view"],
                permissions["roles.view"],
                permissions["permissions.view"],
                permissions["sessions.view"],
                permissions["audit_logs.view"],
            ]
        )

        developer_role, _ = Role.objects.get_or_create(
            name="Developer",
            defaults={
                "description": "Access to API key management and own integration workflows.",
            },
        )
        developer_role.permissions.set(
            [
                permissions["api_keys.manage"],
                permissions["users.view"],
            ]
        )

        admin_user, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@authsphere.dev",
                "first_name": "AuthSphere",
                "last_name": "Admin",
                "is_staff": True,
                "is_superuser": True,
            },
        )

        if created:
            admin_user.set_password("Admin@12345")
            admin_user.save()

        UserRole.objects.get_or_create(user=admin_user, role=admin_role)

        analyst_user, created = User.objects.get_or_create(
            username="analyst",
            defaults={
                "email": "analyst@authsphere.dev",
                "first_name": "Security",
                "last_name": "Analyst",
                "is_staff": False,
            },
        )

        if created:
            analyst_user.set_password("Analyst@12345")
            analyst_user.save()

        UserRole.objects.get_or_create(user=analyst_user, role=security_analyst_role)

        developer_user, created = User.objects.get_or_create(
            username="developer",
            defaults={
                "email": "developer@authsphere.dev",
                "first_name": "API",
                "last_name": "Developer",
                "is_staff": False,
            },
        )

        if created:
            developer_user.set_password("Developer@12345")
            developer_user.save()

        UserRole.objects.get_or_create(user=developer_user, role=developer_role)

        APIKey.objects.get_or_create(
            name="Twilio Messaging Integration",
            user=developer_user,
        )

        APIKey.objects.get_or_create(
            name="Internal IAM Dashboard API",
            user=admin_user,
        )

        AuditLog.objects.get_or_create(
            actor=admin_user,
            action="CREATE",
            resource="SeedData",
            description="Seeded AuthSphere IAM demo data",
        )

        self.stdout.write(self.style.SUCCESS("IAM seed data created successfully."))
