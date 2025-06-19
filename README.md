# Enterprise Commerce Platform

This project is an enterprise-level e-commerce management system built with modern technologies and scalable architecture.

NOTE: Project is under construction.

## 🚀 Overview

This project implements a complete commerce platform with product portfolio management, dynamic pricing, customer segmentation, and distribution chain management using a microservices architecture.

## 📋 Documentation

- [**Functional Objectives**](./docs/functional-objectives.md) - Detailed system requirements and business goals
- [**System Architecture**](./docs/architecture.md) - Technical architecture and design patterns
- [**API Documentation**](./docs/api/) - GraphQL schema and endpoint documentation
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
- **Access Service** - Authentication, authorization, and user management
- **Products Service** - Product catalog and inventory management
- **Commerce Service** - Orders, pricing, promotions, and distribution
- **Scheduling Service** - Calendar events and notifications
- **Business Logic Service** - Analytics, reporting, and business intelligence

### 4. Persistence Layer
- **MySQL Database** - Primary data storage
- **MinIO Object Storage** - File and media storage
- **OpenTelemetry Logs** - Observability and monitoring

## 🛠️ Technology Stack

- **Frontend**: Angular 20, PrimeNG, SCSS, Signals, Redux Pattern
- **Backend**: NestJS, GraphQL, TypeORM
- **Database**: MySQL
- **Message Broker**: Redis + BullMQ
- **Authentication**: Keycloak + RBAC
- **Monitoring**: OpenTelemetry
- **Documentation**: CompoDock
- **Monorepo**: Nx Workspace

## 🔧 Quick Start

```bash
# Install dependencies
npm install

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
│   ├── access-service/       # Authentication & Authorization
│   ├── products-service/     # Product Management
│   ├── commerce-service/     # Commerce Logic
│   ├── scheduling-service/   # Calendar & Events
│   └── business-service/     # Analytics & Reporting
├── tools/                    # Build and deployment tools
├── docs/                     # Documentation
└── infrastructure/          # Docker, Kubernetes, etc.
```

## 🤝 Contributing

Please read our [Contributing Guide](./docs/contributing.md) for details on our code of conduct and development process.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using modern enterprise technologies**
