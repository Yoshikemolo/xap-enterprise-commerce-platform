# Arquitectura del Sistema - Plataforma de Comercio Empresarial

## Descripción General de la Arquitectura

La Plataforma de Comercio Empresarial sigue una arquitectura moderna de microservicios con separación clara de responsabilidades a través de cuatro capas distintas. Este diseño asegura escalabilidad, mantenibilidad y alta disponibilidad mientras soporta requisitos de negocio complejos.

## Principios Arquitectónicos

### 1. Arquitectura Hexagonal (Puertos y Adaptadores)
- **Diseño Dirigido por Dominio**: Lógica de negocio aislada de preocupaciones externas
- **Arquitectura Limpia**: Dependencias apuntan hacia el dominio
- **Testabilidad**: Testing unitario fácil a través de inversión de dependencias
- **Flexibilidad**: Fácil intercambio de implementaciones sin afectar la lógica central

### 2. CQRS (Segregación de Responsabilidades de Comando y Consulta)
- **Modelos de Escritura**: Optimizados para comandos y operaciones de negocio
- **Modelos de Lectura**: Optimizados para consultas y reportes
- **Event Sourcing**: Rastro de auditoría completo de todos los cambios
- **Rendimiento**: Escalado separado para operaciones de lectura y escritura

### 3. Arquitectura Dirigida por Eventos
- **Comunicación Asíncrona**: Acoplamiento débil entre servicios
- **Patrón Inbox/Outbox**: Entrega confiable de mensajes
- **Event Store**: Historial completo de todos los eventos de dominio
- **Consistencia Eventual**: Optimizada para disponibilidad y tolerancia a particiones

## Arquitectura por Capas

### Capa 1: Capa de Aplicación

#### Aplicaciones Frontend
```
┌─────────────────┬─────────────────┐
│   Manager App   │  Customer App   │
│                 │                 │
│ Angular 19      │ Angular 19      │
│ PrimeNG         │ PrimeNG         │
│ Signals         │ Signals         │
│ Patrón Redux    │ Patrón Redux    │
│ SCSS            │ SCSS            │
└─────────────────┴─────────────────┘
```

**Stack Tecnológico:**
- **Framework**: Angular 19 con componentes standalone
- **Biblioteca UI**: PrimeNG para componentes de grado empresarial
- **Gestión de Estado**: Patrón Redux adaptado para Angular Signals
- **Styling**: SCSS con tokens de sistema de diseño
- **Arquitectura**: Lista para micro-frontend con federación de módulos

**Características Clave:**
- **Manager App**: Interfaz administrativa para gestión del sistema
- **Customer App**: Interfaz orientada al cliente para comercio
- **Bibliotecas Compartidas**: Componentes, servicios y utilidades comunes
- **Progressive Web App**: Capacidades offline y experiencia nativa

#### Patrones de Arquitectura de Aplicación
- **Patrón Facade**: Interfaces simplificadas para subsistemas complejos
- **Patrón Observer**: Programación reactiva con RxJS y Signals
- **Patrón Strategy**: Implementaciones de reglas de negocio intercambiables
- **Patrón Factory**: Creación dinámica de componentes y servicios

### Capa 2: Capa de Infraestructura

#### Balanceador de Carga y Proxy Inverso
```
┌─────────────────┐
│     HAProxy     │
│                 │
│ Balanceo de     │
│ Carga           │
│ Terminación SSL │
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
│ Autenticación   │
│ Autorización    │
│ Rate Limiting   │
│ Caching         │
└─────────────────┘
```

#### Bus de Mensajes
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

**Componentes de Infraestructura:**
- **HAProxy**: Balanceador de carga de alta disponibilidad con terminación SSL
- **GraphQL Gateway**: API unificada con federación de esquemas
- **Redis Cluster**: Message broker y capa de caching
- **Let's Encrypt**: Gestión automatizada de certificados SSL

### Capa 3: Capa de Servicios

#### Arquitectura de Microservicios
```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│    Access    │   Products   │   Commerce   │  Scheduling  │   Business   │
│   Service    │   Service    │   Service    │   Service    │   Service    │
│              │              │              │              │              │
│ • Usuarios   │ • Productos  │ • Órdenes    │ • Calendario │ • Analytics  │
│ • Roles      │ • Familias   │ • Precios    │ • Eventos    │ • Reportes   │
│ • Permisos   │ • Stock      │ • Promociones│ • Alertas    │ • NPS        │
│ • Grupos ⭐   │ • Paquetes   │ • Pagos      │ • Notific.   │ • Stats      │
│ • Cuentas    │ • Gestión de │ • Rutas      │              │              │
│              │   Lotes      │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

#### Patrones de Comunicación entre Servicios
- **Federación GraphQL**: Cada servicio posee su porción del esquema
- **Dirigida por Eventos**: Comunicación asíncrona vía eventos Redis
- **Implementación CQRS**: Manejadores separados de comandos y consultas (✅ **TOTALMENTE IMPLEMENTADO EN ACCESS SERVICE**)
- **Patrón Saga**: Gestión de transacciones distribuidas

#### Modelos de Dominio por Servicio

**Dominio Access Service** ✅ **IMPLEMENTACIÓN CQRS COMPLETA**
```
Capa de Dominio
├── Entidades
│   ├── Group (⭐ NUEVA - Jerárquica con profundidad ilimitada)
│   ├── User
│   ├── Role
│   ├── Permission
│   └── Account
├── Agregados
│   ├── GroupAggregate (⭐ NUEVO - Gestión completa de jerarquía)
│   ├── UserAggregate
│   └── RoleAggregate
└── Objetos de Valor
    ├── GroupHierarchy (⭐ NUEVO)
    ├── UserPermissions
    └── RoleDefinition

Capa de Aplicación
├── Commands (13 implementados)
│   ├── CreateGroupCommand ⭐
│   ├── UpdateGroupCommand ⭐
│   ├── DeleteGroupCommand ⭐
│   ├── SetGroupParentCommand ⭐
│   ├── AddUserToGroupCommand ⭐
│   ├── AssignPermissionToGroupCommand ⭐
│   └── ...7 comandos más de groups
├── Queries (16 implementados)
│   ├── GetGroupHierarchyQuery ⭐
│   ├── GetGroupAncestorsQuery ⭐
│   ├── GetGroupDescendantsQuery ⭐
│   ├── GetUserGroupsQuery ⭐
│   ├── GetGroupPermissionsQuery ⭐
│   └── ...11 queries más de groups
└── Servicios de Aplicación
    ├── GroupApplicationService ⭐ (Orquestación CQRS completa)
    ├── UserApplicationService
    └── RoleApplicationService

Capa de Infraestructura
├── Persistencia
│   ├── GroupEntity (⭐ TypeORM Tree con materialized path)
│   ├── UserGroupEntity (⭐ Relación muchos-a-muchos)
│   ├── GroupPermissionEntity (⭐ Relación muchos-a-muchos)
│   └── Repositories (implementaciones TypeORM)
├── HTTP
│   └── GroupController (⭐ 30+ endpoints REST)
└── Eventos
    └── 10 eventos de dominio relacionados con Groups ⭐
```

**Características de Gestión de Grupos** ⭐
- **Estructura Jerárquica**: Relaciones padre-hijo de profundidad ilimitada
- **Sistema DefaultGroup**: Asignación automática de usuarios al grupo por defecto
- **Herencia de Permisos**: Los usuarios heredan permisos de todos sus grupos + grupos padre
- **Operaciones Masivas**: Asignación y eliminación masiva de usuarios/permisos
- **Consultas Avanzadas**: Ancestros, descendientes, hermanos, rutas, niveles
- **Búsqueda y Analytics**: Búsqueda de grupos, estadísticas y monitoreo
- **Patrón CQRS**: Separación completa de comandos y consultas
- **Event Sourcing**: Rastro de auditoría completo de todas las operaciones de grupos

**Dominio Products Service**
- **Entidades**: Product, Family, Package, Stock, Variant, Batch
- **Agregados**: ProductAggregate, FamilyAggregate, StockAggregate
- **Eventos**: ProductCreated, StockUpdated, BatchCreated, PriceChanged
- **Lógica FIFO/FEFO**: Gestión inteligente de inventario con seguimiento de lotes

**Dominio Commerce Service** (Planificado)
- **Entidades**: Order, Offer, Promotion, Transaction, Route, SalesPoint
- **Agregados**: OrderAggregate, PricingAggregate, RouteAggregate
- **Eventos**: OrderPlaced, PaymentProcessed, DeliveryScheduled

**Dominio Scheduling Service** (Planificado)
- **Entidades**: Calendar, Event, Alert, Notification
- **Agregados**: CalendarAggregate, EventAggregate
- **Eventos**: EventScheduled, AlertTriggered, NotificationSent

**Dominio Business Service** (Planificado)
- **Entidades**: NPS, Stats, Pool, Report, Dashboard
- **Agregados**: AnalyticsAggregate, ReportAggregate
- **Eventos**: MetricCalculated, ReportGenerated, DashboardUpdated

### Capa 4: Capa de Persistencia

#### Estrategia de Base de Datos
```
┌─────────────────┬─────────────────┬─────────────────┐
│   MySQL Cluster │ Almacén MinIO   │ OpenTelemetry   │
│                 │                 │     Logs        │
│ • Transaccional │ • Archivos Media│                 │
│ • Soporte ACID  │ • Documentos    │ • Trazado       │
│ • Replicación   │ • Backups       │   Distribuido   │
│ • Sharding      │ • Listo CDN     │ • Métricas      │
└─────────────────┴─────────────────┴─────────────────┘
```

**Estrategia de Almacenamiento de Datos:**
- **MySQL**: Datos transaccionales primarios con replicación maestro-esclavo
- **MinIO**: Almacenamiento de objetos compatible con S3 para archivos y media
- **Redis**: Caching, sesiones y datos temporales
- **Event Store**: Almacenamiento de solo-anexar para eventos de dominio

#### Persistencia de Jerarquía de Grupos ⭐
**El Access Service usa TypeORM Tree con patrón Materialized Path para rendimiento óptimo de jerarquía:**

```sql
-- Tabla groups con soporte para jerarquía
CREATE TABLE groups (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  mpath VARCHAR(255), -- Materialized path para consultas eficientes
  parent_id UUID REFERENCES groups(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Índices optimizados para consultas de jerarquía
CREATE INDEX IDX_groups_mpath ON groups (mpath);
CREATE INDEX IDX_groups_parent_id ON groups (parent_id);
CREATE INDEX IDX_groups_active_hierarchy ON groups (is_active, parent_id, mpath);
```

## Patrones de Arquitectura Técnica

### Implementación CQRS - Access Service ⭐
```
Lado Comando (Modelo Escritura)     Lado Consulta (Modelo Lectura)
┌─────────────────────┐             ┌─────────────────────┐
│   Comandos Groups   │             │   Consultas Groups  │
│                     │             │                     │
│ • CreateGroup       │             │ • GetGroupHierarchy │
│ • UpdateGroup       │             │ • GetGroupAncestors │
│ • DeleteGroup       │             │ • GetGroupUsers     │
│ • AddUserToGroup    │             │ • SearchGroups      │
│ • AssignPermission  │             │ • GetGroupStats     │
│ • SetGroupParent    │             │ • GetUserGroups     │
│ • ...7 más          │             │ • ...10 más         │
└─────────────────────┘             └─────────────────────┘
         │                                   │
         v                                   v
┌─────────────────────┐   Eventos   ┌─────────────────────┐
│ Event Store Groups  │ ───────────▶│ Modelos Lectura     │
│                     │             │ Groups              │
│ • GroupCreated      │             │                     │
│ • GroupUpdated      │             │ • GroupDto          │
│ • UserAddedToGroup  │             │ • GroupHierarchyDto │
│ • PermissionAssigned│             │ • GroupStatsDto     │
│ • ...6 eventos más  │             │ • GroupTreeDto      │
└─────────────────────┘             └─────────────────────┘
```

### Navegación de Jerarquía de Grupos ⭐
**Consultas optimizadas usando patrón materialized path (mpath):**

```typescript
// Obtener todos los descendientes de un grupo
async findDescendants(groupId: string): Promise<Group[]> {
  return await this.groupRepository
    .createQueryBuilder('group')
    .where('group.mpath LIKE :path', { path: `${groupMpath}%` })
    .andWhere('group.id != :groupId', { groupId })
    .orderBy('group.mpath', 'ASC')
    .getMany();
}

// Obtener ancestros de un grupo
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

### Patrón Event Sourcing
- **Event Store**: Secuencia inmutable de eventos de dominio
- **Snapshots**: Snapshots periódicos de estado para rendimiento
- **Replay**: Capacidad de reconstruir estado desde eventos
- **Time Travel**: Consultar estado del sistema en cualquier punto en el tiempo

### Patrón Inbox/Outbox
```
Servicio A                    Servicio B
┌─────────────┐               ┌─────────────┐
│   Outbox    │               │   Inbox     │
│             │               │             │
│ • Event ID  │──────────────▶│ • Event ID  │
│ • Payload   │               │ • Payload   │
│ • Status    │               │ • Status    │
└─────────────┘               └─────────────┘
```

### Arquitectura de Seguridad

#### Autenticación y Autorización ⭐ **Mejorada con Control de Acceso Basado en Grupos**
- **Proveedor de Identidad**: Keycloak con OpenID Connect
- **RBAC + GBAC**: Control de acceso basado en roles + grupos
- **Permisos Jerárquicos**: Herencia de permisos a través de jerarquía de grupos
- **Tokens JWT**: Autenticación sin estado con claims de membresía de grupos
- **Seguridad API**: OAuth 2.0 + OpenID Connect

#### Flujo de Autorización Mejorado ⭐
```
Petición Usuario ──▶ Token JWT ──▶ Extraer User ID ──▶ Obtener Grupos Usuario
     │                                                    │
     │                                                    ▼
     │                                           ┌─────────────────┐
     │                                           │ Jerarquía Grupos│
     │                                           │                 │
     │                                           │ • Grupos Directos│
     │                                           │ • Grupos Padre  │
     │                                           │ • Permisos      │
     │                                           │   Heredados     │
     │                                           └─────────────────┘
     │                                                    │
     ▼                                                    ▼
┌─────────────────┐                              ┌─────────────────┐
│ Decisión        │◀─────────────────────────────│ Permisos        │
│ Autorización    │                              │ Efectivos       │
│                 │                              │                 │
│ • Permitir/Negar│                              │ • Perms Roles   │
│ • Alcance       │                              │ • Perms Grupos  │
│ • Contexto      │                              │ • Heredados     │
└─────────────────┘                              └─────────────────┘
```

#### Capas de Seguridad
```
┌─────────────────────────────────────────┐
│            WAF (Web Application         │
│            Firewall)                    │
├─────────────────────────────────────────┤
│         HAProxy + Terminación SSL       │
├─────────────────────────────────────────┤
│         Autenticación API Gateway       │
├─────────────────────────────────────────┤
│   Capa Autorización Basada en Grupos ⭐ │
├─────────────────────────────────────────┤
│         mTLS Servicio-a-Servicio        │
├─────────────────────────────────────────┤
│         Controles Acceso Base Datos     │
└─────────────────────────────────────────┘
```

## Arquitectura de API ⭐

### Access Service - API de Groups
**30+ endpoints REST con operaciones CRUD completas y de jerarquía:**

```
Gestión de Grupos
├── POST   /api/v1/groups                    # Crear grupo
├── GET    /api/v1/groups                    # Listar todos los grupos
├── GET    /api/v1/groups/{id}               # Obtener grupo por ID
├── PUT    /api/v1/groups/{id}               # Actualizar grupo
├── DELETE /api/v1/groups/{id}               # Eliminar grupo
├── PATCH  /api/v1/groups/{id}/activate      # Activar grupo
└── PATCH  /api/v1/groups/{id}/deactivate    # Desactivar grupo

Operaciones de Jerarquía
├── GET    /api/v1/groups/hierarchy/tree     # Obtener jerarquía completa
├── GET    /api/v1/groups/{id}/ancestors     # Obtener ancestros del grupo
├── GET    /api/v1/groups/{id}/descendants   # Obtener descendientes del grupo
├── GET    /api/v1/groups/{id}/children      # Obtener hijos directos
├── PATCH  /api/v1/groups/{id}/move          # Mover grupo a nuevo padre
└── GET    /api/v1/groups/{id}/path          # Obtener ruta del grupo

Gestión de Usuarios
├── GET    /api/v1/groups/{id}/users         # Obtener usuarios del grupo
├── POST   /api/v1/groups/{id}/users/{userId} # Añadir usuario al grupo
├── DELETE /api/v1/groups/{id}/users/{userId} # Remover usuario del grupo
└── POST   /api/v1/groups/{id}/users/bulk    # Operaciones masivas de usuarios

Gestión de Permisos
├── GET    /api/v1/groups/{id}/permissions   # Obtener permisos del grupo
├── POST   /api/v1/groups/{id}/permissions/{name} # Asignar permiso
├── DELETE /api/v1/groups/{id}/permissions/{name} # Remover permiso
└── POST   /api/v1/groups/{id}/permissions/bulk   # Operaciones masivas de permisos

Operaciones Especiales
├── GET    /api/v1/groups/default            # Obtener grupo por defecto
├── GET    /api/v1/groups/search             # Buscar grupos
├── GET    /api/v1/groups/active             # Obtener grupos activos
├── GET    /api/v1/groups/{id}/stats         # Obtener estadísticas del grupo
└── GET    /api/v1/groups/{id}/full-info     # Obtener info completa del grupo
```

### API Products Service
**31+ endpoints para gestión completa de inventario con lógica FIFO/FEFO**

## Observabilidad y Monitoreo

### Implementación OpenTelemetry
- **Trazado Distribuido**: Seguimiento de peticiones end-to-end
- **Recolección de Métricas**: Métricas de rendimiento y negocio
- **Logging**: Logging estructurado con IDs de correlación
- **Integración APM**: Monitoreo de rendimiento de aplicaciones

### Monitoreo Específico de Grupos ⭐
**El Access Service incluye monitoreo especializado para operaciones de grupos:**

```typescript
// Métricas de operaciones de grupos
export const groupMetrics = {
  hierarchyDepth: new Histogram('group_hierarchy_depth'),
  operationDuration: new Histogram('group_operation_duration_seconds'),
  permissionInheritanceCalc: new Histogram('permission_inheritance_calculation_ms'),
  activeGroups: new Gauge('active_groups_total'),
  usersPerGroup: new Histogram('users_per_group_count'),
  permissionsPerGroup: new Histogram('permissions_per_group_count')
};
```

### Stack de Monitoreo
```
┌─────────────────┬─────────────────┬─────────────────┐
│   Prometheus    │    Grafana      │   Jaeger        │
│                 │                 │                 │
│ • Métricas      │ • Dashboards    │ • Trazado       │
│ • Alertas       │ • Visualización │ • Rendimiento   │
│ • Almacén       │ • Análisis      │ • Dependencias  │
└─────────────────┴─────────────────┴─────────────────┘
```

## Arquitectura de Despliegue

### Estrategia de Contenedores
- **Docker**: Contenerización de aplicaciones
- **Kubernetes**: Orquestación de contenedores
- **Helm Charts**: Empaquetado y despliegue de aplicaciones
- **Service Mesh**: Istio para gestión avanzada de tráfico

### Estrategia de Entornos
```
Desarrollo  ──▶  Staging  ──▶  Producción
     │               │              │
     ▼               ▼              ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│K8s Local│   │K8s Cloud│   │K8s Cloud│
│MinIO    │   │Cloud DB │   │Config HA│
│MySQL    │   │Escala   │   │Escala   │
│Redis    │   │Reducida │   │Completa │
└─────────┘   └─────────┘   └─────────┘
```

## Consideraciones de Escalabilidad

### Escalado Horizontal
- **Servicios Sin Estado**: Todos los servicios diseñados para escalado horizontal
- **Sharding de Base de Datos**: Particionar datos a través de múltiples bases de datos
- **Integración CDN**: Entrega global de contenido
- **Auto-escalado**: Kubernetes HPA y VPA

### Rendimiento de Jerarquía de Grupos ⭐
**Optimizaciones para datasets jerárquicos grandes:**

- **Materialized Path**: Consultas de descendientes O(1) vs CTEs recursivos
- **Estrategia de Caching**: Caching Redis de jerarquías frecuentemente accedidas
- **Optimización de Índices**: Índices especializados para traversal de jerarquía
- **Operaciones Masivas**: Procesamiento por lotes para asignaciones masivas de usuarios/permisos
- **Connection Pooling**: Conexiones de base de datos optimizadas para consultas de jerarquía

### Optimización de Rendimiento
- **Estrategia de Caching**: Caching multi-nivel (Redis, CDN, Aplicación)
- **Connection Pooling**: Optimización de conexiones de base de datos
- **Procesamiento Async**: Procesamiento de trabajos en segundo plano
- **Read Replicas**: Escalado de lectura de base de datos

## Recuperación ante Desastres

### Estrategia de Backup
- **Backups de Base de Datos**: Backups diarios automatizados con recuperación point-in-time
- **Almacenamiento de Objetos**: Replicación cross-region
- **Backups de Configuración**: Almacenamiento de Infrastructure as Code
- **Backups de Event Store**: Preservación completa del rastro de auditoría

### Alta Disponibilidad
- **Despliegue Multi-AZ**: Servicios distribuidos a través de zonas de disponibilidad
- **Health Checks**: Mecanismos automatizados de failover
- **Circuit Breakers**: Patrones de resistencia de servicios
- **Degradación Elegante**: Funcionalidad parcial durante interrupciones

## Estado de Implementación ⭐

### ✅ Servicios Completados
1. **Access Service**: 100% completo con gestión jerárquica de grupos
2. **Products Service**: 100% completo con gestión de inventario FIFO/FEFO

### 🔄 Próxima Fase
1. **Commerce Service**: Gestión de órdenes con integración a servicios existentes
2. **Scheduling Service**: Gestión de calendario y eventos
3. **Business Service**: Analytics y reportes

---

*Este documento de arquitectura proporciona la base para decisiones de implementación técnica y asegura alineación con objetivos de negocio mientras mantiene atributos de calidad del sistema.*

*Última Actualización: 3 de Enero, 2025 - Implementación Completa de Groups en Access Service*