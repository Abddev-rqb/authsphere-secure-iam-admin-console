import graphene


class DashboardSummaryType(graphene.ObjectType):
    total_users = graphene.Int()
    total_roles = graphene.Int()
    total_permissions = graphene.Int()
    total_api_keys = graphene.Int()
    total_sessions = graphene.Int()
    total_audit_logs = graphene.Int()


class Query(graphene.ObjectType):
    dashboard_summary = graphene.Field(DashboardSummaryType)

    def resolve_dashboard_summary(root, info):
        from django.contrib.auth.models import User
        from iam.models import Role, Permission, APIKey, UserSession
        from audit.models import AuditLog

        return DashboardSummaryType(
            total_users=User.objects.count(),
            total_roles=Role.objects.count(),
            total_permissions=Permission.objects.count(),
            total_api_keys=APIKey.objects.count(),
            total_sessions=UserSession.objects.count(),
            total_audit_logs=AuditLog.objects.count(),
        )


schema = graphene.Schema(query=Query)
