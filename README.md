# Enterprise Commerce Platform

This project is a comprehensive enterprise-level commerce management system built with modern technologies and scalable architecture.

## 🚀 Overview

This project implements a complete commerce platform with product portfolio management, dynamic pricing, customer segmentation, and distribution chain management using a microservices architecture.

## 📋 Documentation

- [**Project Status**](./docs/project-status.md) - **Current implementation status** and development roadmap
- [**Products Service Implementation**](./libs/products-service/PRODUCTS-SERVICE-IMPLEMENTATION.md) - **NEW**: Complete Products Service CQRS documentation
- [**Access Service CQRS**](./libs/access-service/CQRS-IMPLEMENTATION.md) - Complete Access Service CQRS documentation
- [**Functional Objectives**](./docs/functional-objectives.md) - Detailed system requirements and business goals
- [**System Architecture**](./docs/architecture.md) - Technical architecture and design patterns
- [**Development Guide**](./docs/development.md) - Setup and development instructions

## 🏗️ Architecture Overview

The system is organized in 4 distinct layers:

### 1. Application Layer
- **Manager App** - Administrative interface for system management
- **Customer App** - End-user interface for product browsing and ordering

### 2. Infrastructure Layer
- **HAProxy** - Load balancer and reverse proxy
- **GraphQL Gateway** - Unified API endpoint
- **Message Bus** - Event-driven communication with BullMQ

### 3. Services Layer
- **Access Service** - 🔐 Authentication, authorization, and user management (✅ **COMPLETE**)
- **Products Service** - 🛍️ Product catalog and inventory management (🔄 **60% COMPLETE**)
  - ✅ Domain Layer with batch traceability
  - ✅ 25+ Commands implemented
  - ✅ FIFO/FEFO logic for inventory rotation
  - 🔄 Queries & Application Services (in progress)
- **Commerce Service** - Orders, pricing, promotions, and distribution (📋 **PLANNED**)
- **Scheduling Service** - Calendar events and notifications (📋 **PLANNED**)
- **Business Logic Service** - Analytics, reporting, and business intelligence (📋 **PLANNED**)

### 4. Persistence Layer
- **MySQL Database** - Primary data storage
- **MinIO Object Storage** - File and media storage
- **OpenTelemetry Logs** - Observability and monitoring

## 🛠️ Technology Stack

- **Frontend**: Angular 19, PrimeNG, SCSS, Signals, Redux Pattern
- **Backend**: NestJS, GraphQL, TypeORM, **CQRS Pattern**
- **Database**: MySQL
- **Message Broker**: Redis + BullMQ
- **Authentication**: Keycloak + RBAC
- **Architecture**: **Hexagonal + DDD + Event Sourcing**
- **Monitoring**: OpenTelemetry
- **Documentation**: CompoDock
- **Monorepo**: Nx Workspace 20.5
- **GraphQL**: Apollo Server v4 + Apollo Gateway v2.9
- **Linting**: ESLint v9 + TypeScript ESLint v8
- **Testing**: Jest 29.7 + Cypress

## 🔧 Quick Start

```bash
# Install dependencies
npm install

# Start infrastructure services
docker-compose up -d mysql redis redis-bullmq minio keycloak

# Start development environment
npm run dev

# Build all applications
npm run build

# Run tests
npm run test
```

## 📦 Project Structure

```
enterprise-commerce-platform/
├── apps/
│   ├── manager-app/          # Administrative SPA
│   ├── customer-app/         # Customer-facing SPA
│   └── api-gateway/          # GraphQL Gateway
├── libs/
│   ├── shared/               # Shared utilities and types
│   ├── access-service/       # 🔐 Authentication & Authorization (✅ COMPLETE)
│   │                        # └── 20+ Commands, 25+ Queries, Infrastructure Layer
│   ├── products-service/     # 🛍️ Product Management (🔄 60% COMPLETE)
│   │                        # ├── ✅ Domain Layer with batch management
│   │                        # ├── ✅ 25+ Commands with FIFO/FEFO logic
│   │                        # ├── 🔄 Queries & QueryHandlers (in progress)
│   │                        # ├── 📋 Application Services (planned)
│   │                        # └── 📋 Infrastructure Layer (planned)
│   ├── commerce-service/     # Commerce Logic (📋 PLANNED)
│   ├── scheduling-service/   # Calendar & Events (📋 PLANNED)
│   └── business-service/     # Analytics & Reporting (📋 PLANNED)
├── tools/                    # Build and deployment tools
├── docs/                     # Documentation
└── infrastructure/          # Docker, Kubernetes, etc.
```

## 🎯 Current Development Status

### ✅ **Completed Services**
- **🔐 Access Service**: Complete CQRS implementation with security features
- **🛍️ Products Service**: Domain Layer & Commands complete (60%)

### 🔄 **In Progress**
- **Products Service**: Queries, DTOs, Application Services, Infrastructure Layer

### 📋 **Next Priority**
- Complete Products Service implementation
- Commerce Service development
- Frontend applications development

## 🚀 Key Features Implemented

### Products Service Innovations
- **📦 Batch Traceability**: Complete product → batch → order tracking
- **🔄 FIFO/FEFO Logic**: Smart inventory rotation (First In/First Out, First Expired/First Out)
- **🏷️ Product Codes**: Mandatory productCode for business identification
- **📊 Batch Numbers**: Unique batch identifiers for complete traceability
- **⚠️ Smart Alerts**: Low stock and expiration warnings
- **📋 Stock Management**: Advanced reservations, releases, consumption tracking

### Access Service Features
- **🔐 RBAC**: Complete Role-Based Access Control
- **👤 User Management**: Full CRUD with security analytics
- **🔑 Permission System**: Granular permissions with conditions
- **📊 Security Analytics**: Comprehensive reporting and monitoring

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](./docs/contributing.md) for details on our code of conduct, development process, and how to submit pull requests.

### Quick Contribution Steps

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Commit your changes** (`git commit -m 'feat(scope): add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

## 📈 Development Roadmap

### Phase 1: Core Services (Current)
- ✅ Access Service (Complete)
- 🔄 Products Service (60% complete)
- 📋 Commerce Service (Next)

### Phase 2: Integration & Frontend
- 📋 API Gateway with GraphQL Federation
- 📋 Manager App development
- 📋 Customer App development

### Phase 3: Advanced Features
- 📋 Advanced analytics and reporting
- 📋 Real-time notifications
- 📋 Performance optimization

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Copyright (c) 2025 Ximplicity Software Solutions, S.L.**  
**Author: Jorge Rodríguez Rengel (AKA Yoshikemolo)**

---

**Built with ❤️ using modern enterprise technologies**

## 🌟 Recent Updates

### June 20, 2025 - Products Service Foundation Complete
- ✅ **Domain Layer**: Product, Stock, Family, Package entities with advanced business logic
- ✅ **Commands**: 25+ Commands with CommandHandlers for all operations
- ✅ **Batch Management**: Complete traceability system with FIFO/FEFO logic
- ✅ **Product Codes**: Mandatory productCode implementation
- ✅ **Value Objects**: Robust validation and business rules
- 🔄 **Next**: Queries, DTOs, Application Services implementation

*View complete progress in [Project Status](./docs/project-status.md)*