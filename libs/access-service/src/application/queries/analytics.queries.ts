import { IQuery } from '@nestjs/cqrs';

// Analytics and Reporting Queries
export class GetUserStatisticsQuery implements IQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetRoleStatisticsQuery implements IQuery {
  constructor() {}
}

export class GetPermissionStatisticsQuery implements IQuery {
  constructor() {}
}

export class GetSecurityReportQuery implements IQuery {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}

export class GetLoginStatisticsQuery implements IQuery {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly granularity: 'hour' | 'day' | 'week' | 'month' = 'day'
  ) {}
}

export class GetUserActivityReportQuery implements IQuery {
  constructor(
    public readonly userId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly activityType?: string
  ) {}
}

export class GetRoleUsageReportQuery implements IQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetPermissionUsageReportQuery implements IQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetAccessPatternsQuery implements IQuery {
  constructor(
    public readonly userId?: string,
    public readonly resource?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetSessionAnalyticsQuery implements IQuery {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly granularity: 'hour' | 'day' | 'week' | 'month' = 'day'
  ) {}
}

export class GetGeographicAccessReportQuery implements IQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetDeviceAccessReportQuery implements IQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetBrowserAccessReportQuery implements IQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetPeakUsageTimesQuery implements IQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetUserEngagementMetricsQuery implements IQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetSystemPerformanceMetricsQuery implements IQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetComplianceReportQuery implements IQuery {
  constructor(
    public readonly complianceType: 'gdpr' | 'sox' | 'pci' | 'hipaa' | 'iso27001',
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetAuditTrailReportQuery implements IQuery {
  constructor(
    public readonly entityType: 'user' | 'role' | 'permission',
    public readonly entityId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetPasswordPolicyComplianceQuery implements IQuery {
  constructor() {}
}

export class GetInactiveUsersReportQuery implements IQuery {
  constructor(public readonly daysSinceLastLogin: number = 30) {}
}

export class GetUserGrowthTrendsQuery implements IQuery {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly granularity: 'day' | 'week' | 'month' = 'month'
  ) {}
}

export class GetRoleDistributionQuery implements IQuery {
  constructor() {}
}

export class GetPermissionDistributionQuery implements IQuery {
  constructor() {}
}

export class GetAccessFrequencyQuery implements IQuery {
  constructor(
    public readonly resource?: string,
    public readonly action?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetUserRetentionMetricsQuery implements IQuery {
  constructor(
    public readonly cohortStartDate: Date,
    public readonly periodType: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ) {}
}

export class GetFeatureUsageQuery implements IQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetErrorRateAnalyticsQuery implements IQuery {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly granularity: 'hour' | 'day' | 'week' = 'day'
  ) {}
}

export class GetCapacityPlanningDataQuery implements IQuery {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}

export class GetCostAnalyticsQuery implements IQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetBenchmarkingReportQuery implements IQuery {
  constructor(
    public readonly metric: 'user_growth' | 'session_duration' | 'login_frequency' | 'feature_adoption',
    public readonly period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ) {}
}

export class GetDataExportQuery implements IQuery {
  constructor(
    public readonly exportType: 'users' | 'roles' | 'permissions' | 'audit_logs' | 'analytics',
    public readonly format: 'csv' | 'json' | 'xlsx' | 'pdf',
    public readonly filters?: Record<string, any>,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetCustomReportQuery implements IQuery {
  constructor(
    public readonly reportDefinition: {
      name: string;
      description: string;
      entities: string[];
      fields: string[];
      filters: Record<string, any>;
      groupBy?: string[];
      orderBy?: string[];
      aggregations?: Record<string, string>;
    },
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

export class GetDashboardDataQuery implements IQuery {
  constructor(
    public readonly dashboardType: 'executive' | 'operational' | 'security' | 'compliance',
    public readonly timeRange: '1h' | '24h' | '7d' | '30d' | '90d' | '1y' = '24h'
  ) {}
}
