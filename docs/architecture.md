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
│ Angular 20      │ Angular 20      │
│ PrimeNG         │ PrimeNG         │
│ Signals         │ Signals         │
│ Redux Pattern   │ Redux Pattern   │
│ SCSS            │ SCSS            │
└─────────────────┴─────────────────┘
```

**Technology Stack:**
- **Framework**: Angular 20 with standalone components
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
│ • Groups     │ • Packages   │ • Payments   │ • Notifications│ • Stats     │
│ • Accounts   │              │ • Routes     │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

#### Service Communication Patterns
- **GraphQL Federation**: Each service owns its schema portion
- **Event-Driven**: Asynchronous communication via Redis events
- **CQRS Implementation**: Separate command and query handlers (✅ **IMPLEMENTED IN ACCESS SERVICE**)
- **Saga Pattern**: Distributed transaction management

#### Domain Models per Service

**Access Service Domain** (✅ **CQRS IMPLEMENTED**)
- **Entities**: Person, User, Role, Permission, Group, Account, Preferences
- **Aggregates**: UserAggregate, RoleAggregate, GroupAggregate
- **Events**: UserCreated, RoleAssigned, PermissionGranted
- **Commands**: 20+ implemented (CreateUser, UpdateUser, AssignRole, etc.)
- **Queries**: 25+ implemented (GetUser, SearchUsers, CheckPermissions, etc.)
- **Application Services**: UserApplicationService, RoleApplicationService, PermissionApplicationService

**Products Service Domain**
- **Entities**: Product, Family, Package, Stock, Variant
- **Aggregates**: ProductAggregate, FamilyAggregate, StockAggregate
- **Events**: ProductCreated, StockUpdated, PriceChanged

**Commerce Service Domain**
- **Entities**: Order, Offer, Promotion, Transaction, Route, SalesPoint
- **Aggregates**: OrderAggregate, PricingAggregate, RouteAggregate
- **Events**: OrderPlaced, PaymentProcessed, DeliveryScheduled

**Scheduling Service Domain**
- **Entities**: Calendar, Event, Alert, Notification
- **Aggregates**: CalendarAggregate, EventAggregate
- **Events**: EventScheduled, AlertTriggered, NotificationSent

**Business Service Domain**
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

## Technical Architecture Patterns

### CQRS Implementation
```
Command Side                    Query Side
┌─────────────┐                ┌─────────────┐
│   Commands  │                │   Queries   │
│             │                │             │
│ • Validate  │                │ • Read      │
│ • Execute   │                │ • Project   │
│ • Store     │                │ • Cache     │
└─────────────┘                └─────────────┘
       │                              │
       v                              v
┌─────────────┐    Events     ┌─────────────┐
│ Event Store │ ──────────────▶│ Read Models │
└─────────────┘               └─────────────┘
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

#### Authentication & Authorization
- **Identity Provider**: Keycloak with OpenID Connect
- **RBAC Implementation**: Role-based access control
- **JWT Tokens**: Stateless authentication
- **API Security**: OAuth 2.0 + OpenID Connect

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
│         Service-to-Service mTLS         │
├─────────────────────────────────────────┤
│         Database Access Controls        │
└─────────────────────────────────────────┘
```

## Observability & Monitoring

### OpenTelemetry Implementation
- **Distributed Tracing**: End-to-end request tracking
- **Metrics Collection**: Performance and business metrics
- **Logging**: Structured logging with correlation IDs
- **APM Integration**: Application performance monitoring

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

---

*This architecture document provides the foundation for technical implementation decisions and ensures alignment with business objectives while maintaining system quality attributes.*