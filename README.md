# Enterprise Commerce Platform

<!-- Language Selector -->
<div align="center">

**🌐 Choose your language / Elige tu idioma:**

[![English](https://img.shields.io/badge/English-🇺🇸-blue?style=for-the-badge)](#english) | [![Español](https://img.shields.io/badge/Español-🇪🇸-red?style=for-the-badge)](#español)

---

</div>

## English

This project is a comprehensive enterprise-level commerce management system built with modern technologies and scalable architecture.

### 🚀 Overview

This project implements a complete commerce platform with product portfolio management, dynamic pricing, customer segmentation, and distribution chain management using a microservices architecture.

### 📋 Documentation

- **[🚀 XAP Enterprise Commerce Platform](./docs/en/xap-marketing.md)** - **Marketing overview for SMBs and enterprises**
- [**Project Status**](./docs/en/project-status.md) - **Current implementation status** and development roadmap
- [**Products Service Implementation**](./libs/products-service/PRODUCTS-SERVICE-IMPLEMENTATION.md) - **NEW**: Complete Products Service CQRS documentation
- [**Access Service CQRS**](./libs/access-service/CQRS-IMPLEMENTATION.md) - Complete Access Service CQRS documentation
- [**Functional Objectives**](./docs/en/functional-objectives.md) - Detailed system requirements and business goals
- [**System Architecture**](./docs/en/architecture.md) - Technical architecture and design patterns
- [**Development Guide**](./docs/en/development.md) - Setup and development instructions
- [**Contributing Guide**](./docs/en/contributing.md) - How to contribute to the project
- [**Troubleshooting Guide**](./docs/en/troubleshooting.md) - **NEW**: Comprehensive problem-solving guide
- [**FAQ**](./docs/en/faq.md) - **NEW**: Frequently asked questions and answers
- [**Security Policy**](./SECURITY.md) - **NEW**: Security vulnerability reporting and best practices
- [**Changelog**](./CHANGELOG.md) - **NEW**: Complete version history and release notes

### 🏗️ Architecture Overview

The system is organized in 4 distinct layers:

#### 1. Application Layer
- **Manager App** - Administrative interface for system management
- **Customer App** - End-user interface for product browsing and ordering

#### 2. Infrastructure Layer
- **HAProxy** - Load balancer and reverse proxy
- **GraphQL Gateway** - Unified API endpoint
- **Message Bus** - Event-driven communication with BullMQ

#### 3. Services Layer
- **Access Service** - 🔐 Authentication, authorization, and user management (✅ **COMPLETE**)
- **Products Service** - 🛍️ Product catalog and inventory management (🔄 **60% COMPLETE**)
  - ✅ Domain Layer with batch traceability
  - ✅ 25+ Commands implemented
  - ✅ FIFO/FEFO logic for inventory rotation
  - 🔄 Queries & Application Services (in progress)
- **Commerce Service** - Orders, pricing, promotions, and distribution (📋 **PLANNED**)
- **Scheduling Service** - Calendar events and notifications (📋 **PLANNED**)
- **Business Logic Service** - Analytics, reporting, and business intelligence (📋 **PLANNED**)

#### 4. Persistence Layer
- **MySQL Database** - Primary data storage
- **MinIO Object Storage** - File and media storage
- **OpenTelemetry Logs** - Observability and monitoring

### 🛠️ Technology Stack

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

### 🔧 Quick Start

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

### 📦 Project Structure

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
├── docs/                     # Documentation (🌐 Bilingual: EN/ES)
│   ├── en/                   # English documentation
│   └── es/                   # Spanish documentation
└── infrastructure/          # Docker, Kubernetes, etc.
```

### 🎯 Current Development Status

#### ✅ **Completed Services**
- **🔐 Access Service**: Complete CQRS implementation with security features
- **🛍️ Products Service**: Domain Layer & Commands complete (60%)

#### 🔄 **In Progress**
- **Products Service**: Queries, DTOs, Application Services, Infrastructure Layer

#### 📋 **Next Priority**
- Complete Products Service implementation
- Commerce Service development
- Frontend applications development

### 🚀 Key Features Implemented

#### Products Service Innovations
- **📦 Batch Traceability**: Complete product → batch → order tracking
- **🔄 FIFO/FEFO Logic**: Smart inventory rotation (First In/First Out, First Expired/First Out)
- **🏷️ Product Codes**: Mandatory productCode for business identification
- **📊 Batch Numbers**: Unique batch identifiers for complete traceability
- **⚠️ Smart Alerts**: Low stock and expiration warnings
- **📋 Stock Management**: Advanced reservations, releases, consumption tracking

#### Access Service Features
- **🔐 RBAC**: Complete Role-Based Access Control
- **👤 User Management**: Full CRUD with security analytics
- **🔑 Permission System**: Granular permissions with conditions
- **📊 Security Analytics**: Comprehensive reporting and monitoring

### 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](./docs/en/contributing.md) for details on our code of conduct, development process, and how to submit pull requests.

### 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Copyright (c) 2025 Ximplicity Software Solutions, S.L.**  
**Author: Jorge Rodríguez Rengel (AKA Yoshikemolo)**

---

## Español

Este proyecto es un sistema completo de gestión de comercio empresarial construido con tecnologías modernas y arquitectura escalable.

### 🚀 Descripción General

Este proyecto implementa una plataforma de comercio completa con gestión de portafolio de productos, precios dinámicos, segmentación de clientes y gestión de la cadena de distribución utilizando una arquitectura de microservicios.

### 📋 Documentación

- **[🚀 XAP Enterprise Commerce Platform](./docs/es/xap-marketing.md)** - **Visión comercial para PyMEs y empresas**
- [**Estado del Proyecto**](./docs/es/project-status.md) - **Estado actual de implementación** y hoja de ruta de desarrollo
- [**Implementación Products Service**](./libs/products-service/PRODUCTS-SERVICE-IMPLEMENTATION.md) - **NUEVO**: Documentación completa CQRS del Products Service
- [**CQRS Access Service**](./libs/access-service/CQRS-IMPLEMENTATION.md) - Documentación completa CQRS del Access Service
- [**Objetivos Funcionales**](./docs/es/functional-objectives.md) - Requisitos detallados del sistema y objetivos de negocio
- [**Arquitectura del Sistema**](./docs/es/architecture.md) - Arquitectura técnica y patrones de diseño
- [**Guía de Desarrollo**](./docs/es/development.md) - Instrucciones de configuración y desarrollo
- [**Guía de Contribución**](./docs/es/contributing.md) - Cómo contribuir al proyecto
- [**Guía de Resolución de Problemas**](./docs/es/troubleshooting.md) - **NUEVO**: Guía comprensiva para resolver problemas
- [**FAQ**](./docs/es/faq.md) - **NUEVO**: Preguntas frecuentes y respuestas
- [**Política de Seguridad**](./SECURITY-ES.md) - **NUEVO**: Reporte de vulnerabilidades y mejores prácticas
- [**Changelog**](./CHANGELOG.md) - **NUEVO**: Historial completo de versiones y notas de lanzamiento

### 🏗️ Descripción de la Arquitectura

El sistema está organizado en 4 capas distintas:

#### 1. Capa de Aplicación
- **Manager App** - Interfaz administrativa para gestión del sistema
- **Customer App** - Interfaz de usuario final para navegación y pedidos de productos

#### 2. Capa de Infraestructura
- **HAProxy** - Balanceador de carga y proxy inverso
- **GraphQL Gateway** - Punto de API unificado
- **Message Bus** - Comunicación dirigida por eventos con BullMQ

#### 3. Capa de Servicios
- **Access Service** - 🔐 Autenticación, autorización y gestión de usuarios (✅ **COMPLETO**)
- **Products Service** - 🛍️ Catálogo de productos y gestión de inventario (🔄 **60% COMPLETO**)
  - ✅ Capa de Dominio con trazabilidad de lotes
  - ✅ 25+ Comandos implementados
  - ✅ Lógica FIFO/FEFO para rotación de inventario
  - 🔄 Queries y Application Services (en progreso)
- **Commerce Service** - Órdenes, precios, promociones y distribución (📋 **PLANIFICADO**)
- **Scheduling Service** - Eventos de calendario y notificaciones (📋 **PLANIFICADO**)
- **Business Logic Service** - Analytics, reportes e inteligencia de negocio (📋 **PLANIFICADO**)

#### 4. Capa de Persistencia
- **Base de Datos MySQL** - Almacenamiento primario de datos
- **MinIO Object Storage** - Almacenamiento de archivos y medios
- **OpenTelemetry Logs** - Observabilidad y monitoreo

### 🛠️ Stack Tecnológico

- **Frontend**: Angular 19, PrimeNG, SCSS, Signals, Redux Pattern
- **Backend**: NestJS, GraphQL, TypeORM, **Patrón CQRS**
- **Base de Datos**: MySQL
- **Message Broker**: Redis + BullMQ
- **Autenticación**: Keycloak + RBAC
- **Arquitectura**: **Hexagonal + DDD + Event Sourcing**
- **Monitoreo**: OpenTelemetry
- **Documentación**: CompoDock
- **Monorepo**: Nx Workspace 20.5
- **GraphQL**: Apollo Server v4 + Apollo Gateway v2.9
- **Linting**: ESLint v9 + TypeScript ESLint v8
- **Testing**: Jest 29.7 + Cypress

### 🔧 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servicios de infraestructura
docker-compose up -d mysql redis redis-bullmq minio keycloak

# Iniciar entorno de desarrollo
npm run dev

# Construir todas las aplicaciones
npm run build

# Ejecutar tests
npm run test
```

### 🎯 Estado Actual del Desarrollo

#### ✅ **Servicios Completados**
- **🔐 Access Service**: Implementación CQRS completa con características de seguridad
- **🛍️ Products Service**: Capa de Dominio y Comandos completos (60%)

#### 🔄 **En Progreso**
- **Products Service**: Queries, DTOs, Application Services, Capa de Infraestructura

#### 📋 **Próxima Prioridad**
- Completar implementación del Products Service
- Desarrollo del Commerce Service
- Desarrollo de aplicaciones frontend

### 🚀 Características Clave Implementadas

#### Innovaciones del Products Service
- **📦 Trazabilidad de Lotes**: Seguimiento completo producto → lote → orden
- **🔄 Lógica FIFO/FEFO**: Rotación inteligente de inventario (Primero en Entrar/Salir, Primero en Vencer/Salir)
- **🏷️ Códigos de Producto**: productCode obligatorio para identificación de negocio
- **📊 Números de Lote**: Identificadores únicos de lotes para trazabilidad completa
- **⚠️ Alertas Inteligentes**: Advertencias de stock bajo y vencimientos
- **📋 Gestión de Stock**: Reservas avanzadas, liberaciones, seguimiento de consumo

#### Características del Access Service
- **🔐 RBAC**: Control de Acceso Basado en Roles completo
- **👤 Gestión de Usuarios**: CRUD completo con analytics de seguridad
- **🔑 Sistema de Permisos**: Permisos granulares con condiciones
- **📊 Analytics de Seguridad**: Reportes y monitoreo comprehensivo

### 🤝 Contribuir

¡Damos la bienvenida a contribuciones de la comunidad! Por favor lee nuestra [Guía de Contribución](./docs/es/contributing.md) para detalles sobre nuestro código de conducta, proceso de desarrollo y cómo enviar pull requests.

### 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT** - consulta el archivo [LICENSE](LICENSE) para más detalles.

**Copyright (c) 2025 Ximplicity Software Solutions, S.L.**  
**Autor: Jorge Rodríguez Rengel (AKA Yoshikemolo)**

---

### 🌟 Actualizaciones Recientes

**20 de Junio, 2025 - Fundación del Products Service Completa**
- ✅ **Capa de Dominio**: Entidades Product, Stock, Family, Package con lógica de negocio avanzada
- ✅ **Comandos**: 25+ Comandos con CommandHandlers para todas las operaciones
- ✅ **Gestión de Lotes**: Sistema de trazabilidad completo con lógica FIFO/FEFO
- ✅ **Códigos de Producto**: Implementación de productCode obligatorio
- ✅ **Value Objects**: Validación robusta y reglas de negocio
- 🔄 **Siguiente**: Implementación de Queries, DTOs, Application Services

*Ver progreso completo en [Estado del Proyecto](./docs/es/project-status.md)*

---

**Construido con ❤️ usando tecnologías empresariales modernas**