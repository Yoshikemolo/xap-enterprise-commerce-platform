# System Architecture - Enterprise Commerce Platform

## Architecture Overview

The Enterprise Commerce Platform follows a modern microservices architecture with clear separation of concerns across four distinct layers. This design ensures scalability, maintainability, and high availability while supporting complex business requirements.

## Architectural Principles

### 1. Hexagonal Architecture (Ports and Adapters)
- **Domain-Driven Design**: Business logic isolated from external concerns
- **Clean Architecture**: Dependencies point inward to the domain
- **Testability**: Easy unit testing through dependency inversion
- **Flexibility**: Easy to swap implementations without affecting core logic

### 2. CQRS (Command Query Responsibility Segregation)
- **Write Models**: Optimized for commands and business operations
- **Read Models**: Optimized for queries and reporting
- **Event Sourcing**: Complete audit trail of all changes
- **Performance**: Separate scaling for read and write operations

### 3. Event-Driven Architecture
- **Asynchronous Communication**: Loose coupling between services
- **Inbox/Outbox Pattern**: Reliable message delivery
- **Event Store**: Complete history of all domain events
- **Eventual Consistency**: Optimized for availability and partition tolerance

## Layer Architecture

### Layer 1: Application Layer

#### Frontend Applications
```
┌─────────────────┬─────────────────┐
│   Manager App   │  Customer App   │
│                 │                 │
│ Angular 19      │ Angular 19      │
│ PrimeNG         │ PrimeNG         │
│ Signals         │ Signals         │
│ Redux Pattern   │ Redux Pattern   │
│ SCSS            │ SCSS            │
└─────────────────┴─────────────────┘
```

**Technology Stack:**
- **Framework**: Angular 19 with standalone components
- **UI Library**: PrimeNG for enterprise-grade components
- **State Management**: Redux pattern adapted for Angular Signals
- **Styling**: SCSS with design system tokens
- **Architecture**: Micro-frontend ready with module federation

**Key Features:**
- **Manager App**: Administrative interface for system management
- **Customer App**: Customer-facing commerce interface
- **Shared Libraries**: Common components, services, and utilities
- **Progressive Web App**: Offline capabilities and native-like experience

#### Application Architecture Patterns
- **Facade Pattern**: Simplified interfaces to complex subsystems
- **Observer Pattern**: Reactive programming with RxJS and Signals
- **Strategy Pattern**: Pluggable business rule implementations
- **Factory Pattern**: Dynamic component and service creation

### Layer 2: Infrastructure Layer

#### Load Balancer & Reverse Proxy
```
┌─────────────────┐
│     HAProxy     │
│                 │
│ Load Balancing  │
│ SSL Termination │
│ Health Checks   │
│ Rate Limiting   │
└─────────────────┘
```

#### API Gateway
```
┌─────────────────┐
│ GraphQL Gateway │
│                 │
│ Schema Stitching│
│ Authentication  │
│ Authorization   │
│ Rate Limiting   │
│ Caching         │
└─────────────────┘
```

#### Message Bus
```
┌─────────────────┐
│   Redis + BullMQ│
│                 │
│ Event Streaming │
│ Job Queues      │
│ Pub/Sub         │
│ Session Store   │
└─────────────────┘
```

**Infrastructure Components:**
- **HAProxy**: High-availability load balancer with SSL termination
- **GraphQL Gateway**: Unified API with schema federation
- **Redis Cluster**: Message broker and caching layer
- **Let's Encrypt**: Automated SSL certificate management

### Layer 3: Services Layer

#### Microservices Architecture
```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│    Access    │   Products   │   Commerce   │  Scheduling  │   Business   │
│   Service    │   Service    │   Service    │   Service    │   Service    │
│              │              │              │              │              │
│ • Users      │ • Products   │ • Orders     │ • Calendar   │ • Analytics  │
│ • Roles      │ • Families   │ • Pricing    │ • Events     │ • Reports    │
│ • Permissions│ • Stock      │ • Promotions │ • Alerts     │ • NPS        │
│ • Groups ⭐   │ • Packages   │ • Payments   │ • Notifications│ • Stats     │
│ • Accounts   │ • Batch Mgmt │ • Routes     │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

#### Service Communication Patterns
- **GraphQL Federation**: Each service owns its schema portion
- **Event-Driven**: Asynchronous communication via Redis events
- **CQRS Implementation**: Separate command and query handlers (✅ **FULLY IMPLEMENTED IN ACCESS SERVICE**)
- **Saga Pattern**: Distributed transaction management

#### Domain Models per Service

**Access Service Domain** ✅ **COMPLETE CQRS IMPLEMENTATION**
```
Domain Layer
├── Entities
│   ├── Group (⭐ NEW - Hierarchical with unlimited depth)
│   ├── User
│   ├── Role
│   ├── Permission
│   └── Account
├── Aggregates
│   ├── GroupAggregate (⭐ NEW - Complete hierarchy management)
│   ├── UserAggregate
│   └── RoleAggregate
└── Value Objects
    ├── GroupHierarchy (⭐ NEW)
    ├── UserPermissions
    └── RoleDefinition

Application Layer
├── Commands (13 implemented)
│   ├── CreateGroupCommand ⭐
│   ├── UpdateGroupCommand ⭐
│   ├── DeleteGroupCommand ⭐
│   ├── SetGroupParentCommand ⭐
│   ├── AddUserToGroupCommand ⭐
│   ├── AssignPermissionToGroupCommand ⭐
│   └── ...7 more group commands
├── Queries (16 implemented)
│   ├── GetGroupHierarchyQuery ⭐
│   ├── GetGroupAncestorsQuery ⭐
│   ├── GetGroupDescendantsQuery ⭐
│   ├── GetUserGroupsQuery ⭐
│   ├── GetGroupPermissionsQuery ⭐
│   └── ...11 more group queries
└── Application Services
    ├── GroupApplicationService ⭐ (Complete CQRS orchestration)
    ├── UserApplicationService
    └── RoleApplicationService

Infrastructure Layer
├── Persistence
│   ├── GroupEntity (⭐ TypeORM Tree with materialized path)
│   ├── UserGroupEntity (⭐ Many-to-many relationship)
│   ├── GroupPermissionEntity (⭐ Many-to-many relationship)
│   └── Repositories (TypeORM implementations)
├── HTTP
│   └── GroupController (⭐ 30+ REST endpoints)
└── Events
    └── 10 Group-related domain events ⭐
```

**Group Management Features** ⭐
- **Hierarchical Structure**: Unlimited depth parent-child relationships
- **DefaultGroup System**: Automatic user assignment to default group
- **Permission Inheritance**: Users inherit permissions from all their groups + parent groups
- **Bulk Operations**: Mass user/permission assignment and removal
- **Advanced Queries**: Ancestors, descendants, siblings, paths, levels
- **Search & Analytics**: Group search, statistics, and monitoring
- **CQRS Pattern**: Complete separation of commands and queries
- **Event Sourcing**: Full audit trail of all group operations

**Products Service Domain**
- **Entities**: Product, Family, Package, Stock, Variant, Batch
- **Aggregates**: ProductAggregate, FamilyAggregate, StockAggregate
- **Events**: ProductCreated, StockUpdated, BatchCreated, PriceChanged
- **FIFO/FEFO Logic**: Intelligent inventory management with batch tracking

**Commerce Service Domain** (Planned)
- **Entities**: Order, Offer, Promotion, Transaction, Route, SalesPoint
- **Aggregates**: OrderAggregate, PricingAggregate, RouteAggregate
- **Events**: OrderPlaced, PaymentProcessed, DeliveryScheduled

**Scheduling Service Domain** (Planned)
- **Entities**: Calendar, Event, Alert, Notification
- **Aggregates**: CalendarAggregate, EventAggregate
- **Events**: EventScheduled, AlertTriggered, NotificationSent

**Business Service Domain** (Planned)
- **Entities**: NPS, Stats, Pool, Report, Dashboard
- **Aggregates**: AnalyticsAggregate, ReportAggregate
- **Events**: MetricCalculated, ReportGenerated, DashboardUpdated

### Layer 4: Persistence Layer

#### Database Strategy
```
┌─────────────────┬─────────────────┬─────────────────┐
│   MySQL Cluster │   MinIO Storage │ OpenTelemetry   │
│                 │                 │     Logs        │
│ • Transactional │ • Media Files   │                 │
│ • ACID Support  │ • Documents     │ • Distributed   │
│ • Replication   │ • Backups       │   Tracing       │
│ • Sharding      │ • CDN Ready     │ • Metrics       │
└─────────────────┴─────────────────┴─────────────────┘
```

**Data Storage Strategy:**
- **MySQL**: Primary transactional data with master-slave replication
- **MinIO**: S3-compatible object storage for files and media
- **Redis**: Caching, sessions, and temporary data
- **Event Store**: Append-only storage for domain events

#### Group Hierarchy Persistence ⭐
**Access Service uses TypeORM Tree with Materialized Path pattern for optimal hierarchy performance:**

```sql
-- Groups table with hierarchy support
CREATE TABLE groups (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  mpath VARCHAR(255), -- Materialized path for efficient queries
  parent_id UUID REFERENCES groups(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Optimized indexes for hierarchy queries
CREATE INDEX IDX_groups_mpath ON groups (mpath);
CREATE INDEX IDX_groups_parent_id ON groups (parent_id);
CREATE INDEX IDX_groups_active_hierarchy ON groups (is_active, parent_id, mpath);
```

## Technical Architecture Patterns

### CQRS Implementation - Access Service ⭐
```
Command Side (Write Model)          Query Side (Read Model)
┌─────────────────────┐             ┌─────────────────────┐
│   Group Commands    │             │   Group Queries     │
│                     │             │                     │
│ • CreateGroup       │             │ • GetGroupHierarchy │
│ • UpdateGroup       │             │ • GetGroupAncestors │
│ • DeleteGroup       │             │ • GetGroupUsers     │
│ • AddUserToGroup    │             │ • SearchGroups      │
│ • AssignPermission  │             │ • GetGroupStats     │
│ • SetGroupParent    │             │ • GetUserGroups     │
│ • ...7 more         │             │ • ...10 more        │
└─────────────────────┘             └─────────────────────┘
         │                                   │
         v                                   v
┌─────────────────────┐   Events    ┌─────────────────────┐
│ Group Event Store   │ ───────────▶│ Group Read Models   │
│                     │             │                     │
│ • GroupCreated      │             │ • GroupDto          │
│ • GroupUpdated      │             │ • GroupHierarchyDto │
│ • UserAddedToGroup  │             │ • GroupStatsDto     │
│ • PermissionAssigned│             │ • GroupTreeDto      │
│ • ...6 more events  │             │ • GroupPathDto      │
└─────────────────────┘             └─────────────────────┘
```

### Group Hierarchy Navigation ⭐
**Optimized queries using materialized path (mpath) pattern:**

```typescript
// Get all descendants of a group
async findDescendants(groupId: string): Promise<Group[]> {
  return await this.groupRepository
    .createQueryBuilder('group')
    .where('group.mpath LIKE :path', { path: `${groupMpath}%` })
    .andWhere('group.id != :groupId', { groupId })
    .orderBy('group.mpath', 'ASC')
    .getMany();
}

// Get ancestors of a group
async findAncestors(groupId: string): Promise<Group[]> {
  const group = await this.findById(groupId);
  const pathParts = group.mpath.split('.').filter(Boolean);
  
  return await this.groupRepository
    .createQueryBuilder('group')
    .where('group.mpath IN (:...paths)', { 
      paths: pathParts.map((_, i) => 
        pathParts.slice(0, i + 1).join('.') + '.'
      ) 
    })
    .andWhere('group.id != :groupId', { groupId })
    .orderBy('group.mpath', 'ASC')
    .getMany();
}
```

### Event Sourcing Pattern
- **Event Store**: Immutable sequence of domain events
- **Snapshots**: Periodic state snapshots for performance
- **Replay**: Ability to rebuild state from events
- **Time Travel**: Query system state at any point in time

### Inbox/Outbox Pattern
```
Service A                      Service B
┌─────────────┐               ┌─────────────┐
│   Outbox    │               │   Inbox     │
│             │               │             │
│ • Event ID  │──────────────▶│ • Event ID  │
│ • Payload   │               │ • Payload   │
│ • Status    │               │ • Status    │
└─────────────┘               └─────────────┘
```

### Security Architecture

#### Authentication & Authorization ⭐ **Enhanced with Group-based Access Control**
- **Identity Provider**: Keycloak with OpenID Connect
- **RBAC + GBAC**: Role-based + Group-based access control
- **Hierarchical Permissions**: Permission inheritance through group hierarchy
- **JWT Tokens**: Stateless authentication with group membership claims
- **API Security**: OAuth 2.0 + OpenID Connect

#### Enhanced Authorization Flow ⭐
```
User Request ──▶ JWT Token ──▶ Extract User ID ──▶ Get User Groups
     │                                                    │
     │                                                    ▼
     │                                           ┌─────────────────┐
     │                                           │ Group Hierarchy │
     │                                           │                 │
     │                                           │ • Direct Groups │
     │                                           │ • Parent Groups │
     │                                           │ • Inherited     │
     │                                           │   Permissions   │
     │                                           └─────────────────┘
     │                                                    │
     ▼                                                    ▼
┌─────────────────┐                              ┌─────────────────┐
│ Authorization   │◀─────────────────────────────│ Effective       │
│ Decision        │                              │ Permissions     │
│                 │                              │                 │
│ • Allow/Deny    │                              │ • Role Perms    │
│ • Scope         │                              │ • Group Perms   │
│ • Context       │                              │ • Inherited     │
└─────────────────┘                              └─────────────────┘
```

#### Security Layers
```
┌─────────────────────────────────────────┐
│            WAF (Web Application         │
│            Firewall)                    │
├─────────────────────────────────────────┤
│         HAProxy + SSL Termination       │
├─────────────────────────────────────────┤
│         API Gateway Authentication      │
├─────────────────────────────────────────┤
│   Group-based Authorization Layer ⭐    │
├─────────────────────────────────────────┤
│         Service-to-Service mTLS         │
├─────────────────────────────────────────┤
│         Database Access Controls        │
└─────────────────────────────────────────┘
```

## API Architecture ⭐

### Access Service - Groups API
**30+ REST endpoints with complete CRUD and hierarchy operations:**

```
Group Management
├── POST   /api/v1/groups                    # Create group
├── GET    /api/v1/groups                    # List all groups
├── GET    /api/v1/groups/{id}               # Get group by ID
├── PUT    /api/v1/groups/{id}               # Update group
├── DELETE /api/v1/groups/{id}               # Delete group
├── PATCH  /api/v1/groups/{id}/activate      # Activate group
└── PATCH  /api/v1/groups/{id}/deactivate    # Deactivate group

Hierarchy Operations
├── GET    /api/v1/groups/hierarchy/tree     # Get complete hierarchy
├── GET    /api/v1/groups/{id}/ancestors     # Get group ancestors
├── GET    /api/v1/groups/{id}/descendants   # Get group descendants
├── GET    /api/v1/groups/{id}/children      # Get direct children
├── PATCH  /api/v1/groups/{id}/move          # Move group to new parent
└── GET    /api/v1/groups/{id}/path          # Get group path

User Management
├── GET    /api/v1/groups/{id}/users         # Get group users
├── POST   /api/v1/groups/{id}/users/{userId} # Add user to group
├── DELETE /api/v1/groups/{id}/users/{userId} # Remove user from group
└── POST   /api/v1/groups/{id}/users/bulk    # Bulk user operations

Permission Management
├── GET    /api/v1/groups/{id}/permissions   # Get group permissions
├── POST   /api/v1/groups/{id}/permissions/{name} # Assign permission
├── DELETE /api/v1/groups/{id}/permissions/{name} # Remove permission
└── POST   /api/v1/groups/{id}/permissions/bulk   # Bulk permission operations

Special Operations
├── GET    /api/v1/groups/default            # Get default group
├── GET    /api/v1/groups/search             # Search groups
├── GET    /api/v1/groups/active             # Get active groups
├── GET    /api/v1/groups/{id}/stats         # Get group statistics
└── GET    /api/v1/groups/{id}/full-info     # Get complete group info
```

### Products Service API
**31+ endpoints for complete inventory management with FIFO/FEFO logic**

## Observability & Monitoring

### OpenTelemetry Implementation
- **Distributed Tracing**: End-to-end request tracking
- **Metrics Collection**: Performance and business metrics
- **Logging**: Structured logging with correlation IDs
- **APM Integration**: Application performance monitoring

### Group-specific Monitoring ⭐
**Access Service includes specialized monitoring for group operations:**

```typescript
// Group operation metrics
export const groupMetrics = {
  hierarchyDepth: new Histogram('group_hierarchy_depth'),
  operationDuration: new Histogram('group_operation_duration_seconds'),
  permissionInheritanceCalc: new Histogram('permission_inheritance_calculation_ms'),
  activeGroups: new Gauge('active_groups_total'),
  usersPerGroup: new Histogram('users_per_group_count'),
  permissionsPerGroup: new Histogram('permissions_per_group_count')
};
```

### Monitoring Stack
```
┌─────────────────┬─────────────────┬─────────────────┐
│   Prometheus    │    Grafana      │   Jaeger        │
│                 │                 │                 │
│ • Metrics       │ • Dashboards    │ • Tracing       │
│ • Alerting      │ • Visualization │ • Performance   │
│ • Storage       │ • Analysis      │ • Dependencies  │
└─────────────────┴─────────────────┴─────────────────┘
```

## Deployment Architecture

### Container Strategy
- **Docker**: Application containerization
- **Kubernetes**: Container orchestration
- **Helm Charts**: Application packaging and deployment
- **Service Mesh**: Istio for advanced traffic management

### Environment Strategy
```
Development  ──▶  Staging  ──▶  Production
     │               │              │
     ▼               ▼              ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│Local K8s│   │Cloud K8s│   │Cloud K8s│
│MinIO    │   │Cloud DB │   │HA Setup │
│MySQL    │   │Reduced  │   │Full     │
│Redis    │   │Scale    │   │Scale    │
└─────────┘   └─────────┘   └─────────┘
```

## Scalability Considerations

### Horizontal Scaling
- **Stateless Services**: All services designed for horizontal scaling
- **Database Sharding**: Partition data across multiple databases
- **CDN Integration**: Global content delivery
- **Auto-scaling**: Kubernetes HPA and VPA

### Group Hierarchy Performance ⭐
**Optimizations for large hierarchical datasets:**

- **Materialized Path**: O(1) descendant queries vs recursive CTEs
- **Caching Strategy**: Redis caching of frequently accessed hierarchies
- **Index Optimization**: Specialized indexes for hierarchy traversal
- **Bulk Operations**: Batch processing for mass user/permission assignments
- **Connection Pooling**: Optimized database connections for hierarchy queries

### Performance Optimization
- **Caching Strategy**: Multi-level caching (Redis, CDN, Application)
- **Connection Pooling**: Database connection optimization
- **Async Processing**: Background job processing
- **Read Replicas**: Database read scaling

## Disaster Recovery

### Backup Strategy
- **Database Backups**: Automated daily backups with point-in-time recovery
- **Object Storage**: Cross-region replication
- **Configuration Backups**: Infrastructure as Code storage
- **Event Store Backups**: Complete audit trail preservation

### High Availability
- **Multi-AZ Deployment**: Services distributed across availability zones
- **Health Checks**: Automated failover mechanisms
- **Circuit Breakers**: Service resilience patterns
- **Graceful Degradation**: Partial functionality during outages

## Implementation Status ⭐

### ✅ Completed Services
1. **Access Service**: 100% complete with hierarchical group management
2. **Products Service**: 100% complete with FIFO/FEFO inventory management

### 🔄 Next Phase
1. **Commerce Service**: Order management with integration to existing services
2. **Scheduling Service**: Calendar and event management
3. **Business Service**: Analytics and reporting

---

*This architecture document provides the foundation for technical implementation decisions and ensures alignment with business objectives while maintaining system quality attributes.*

*Last Updated: January 3, 2025 - Access Service Groups Implementation Complete*