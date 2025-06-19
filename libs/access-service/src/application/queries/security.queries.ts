import { IQuery } from '@nestjs/cqrs';

// Security and Authorization Queries
export class CheckUserPermissionQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly resource: string,
    public readonly action: string,
    public readonly context?: Record<string, any>
  ) {}
}

export class CheckUserRoleQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly roleName: string
  ) {}
}

export class CheckMultiplePermissionsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly permissions: Array<{ resource: string; action: string }>
  ) {}
}

export class CheckMultipleRolesQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly roleNames: string[]
  ) {}
}

export class GetUserSecurityInfoQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

export class GetUserEffectivePermissionsQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

export class GetUserAccessMatrixQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

export class ValidateUserAccessQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly resource: string,
    public readonly action: string,
    public readonly context?: Record<string, any>
  ) {}
}

export class GetAccessViolationsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetSecurityAlertsQuery implements IQuery {
  constructor(
    public readonly severity?: 'low' | 'medium' | 'high' | 'critical',
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetFailedLoginAttemptsQuery implements IQuery {
  constructor(
    public readonly userId?: string,
    public readonly ipAddress?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetSuspiciousActivitiesQuery implements IQuery {
  constructor(
    public readonly userId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetPasswordPolicyViolationsQuery implements IQuery {
  constructor(
    public readonly userId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetSessionAnomaliesQuery implements IQuery {
  constructor(
    public readonly userId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetPrivilegeEscalationAttemptsQuery implements IQuery {
  constructor(
    public readonly userId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetUnauthorizedAccessAttemptsQuery implements IQuery {
  constructor(
    public readonly resource?: string,
    public readonly action?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetSecurityComplianceReportQuery implements IQuery {
  constructor(
    public readonly reportType: 'access_review' | 'permission_audit' | 'role_analysis' | 'security_gaps'
  ) {}
}

export class GetUserRiskScoreQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

export class GetHighRiskUsersQuery implements IQuery {
  constructor(public readonly threshold: number = 80) {}
}

export class GetPermissionConflictsForUserQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

export class GetRoleConflictsForUserQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

export class GetAccessRecommendationsQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

export class GetSecurityMetricsQuery implements IQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetThreatIntelligenceQuery implements IQuery {
  constructor(
    public readonly threatType?: string,
    public readonly severity?: 'low' | 'medium' | 'high' | 'critical'
  ) {}
}
