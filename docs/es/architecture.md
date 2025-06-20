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

### Capa 2: Capa de Infraestructura

#### Balanceador de Carga y Proxy Inverso
```
┌─────────────────┐
│     HAProxy     │
│                 │
│ Balanceeo       │
│ Terminación SSL │
│ Health Checks   │
│ Rate Limiting   │
└─────────────────┘
```

#### Gateway API
```
┌─────────────────┐
│ Gateway GraphQL │
│                 │
│ Schema Stitching│
│ Autenticación   │
│ Autorización    │
│ Rate Limiting   │
│ Caché           │
└─────────────────┘
```

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
│ • Grupos     │ • Packages   │ • Pagos      │ • Notific.   │ • Stats      │
│ • Cuentas    │              │ • Rutas      │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

#### Patrones de Comunicación de Servicios
- **Federación GraphQL**: Cada servicio posee su porción de esquema
- **Dirigido por Eventos**: Comunicación asíncrona vía eventos Redis
- **Implementación CQRS**: Handlers separados de comando y consulta (✅ **IMPLEMENTADO EN ACCESS SERVICE**)
- **Patrón Saga**: Gestión de transacciones distribuidas

### Capa 4: Capa de Persistencia

#### Estrategia de Base de Datos
```
┌─────────────────┬─────────────────┬─────────────────┐
│  Cluster MySQL  │ Almacén MinIO   │ OpenTelemetry   │
│                 │                 │     Logs        │
│ • Transaccional │ • Archivos      │                 │
│ • Soporte ACID  │ • Documentos    │ • Trazado       │
│ • Replicación   │ • Respaldos     │   Distribuido   │
│ • Sharding      │ • Listo para CDN│ • Métricas      │
└─────────────────┴─────────────────┴─────────────────┘
```

## Patrones de Arquitectura Técnica

### Implementación CQRS
```
Lado Comando                    Lado Consulta
┌─────────────┐                ┌─────────────┐
│   Comandos  │                │   Consultas │
│             │                │             │
│ • Validar   │                │ • Leer      │
│ • Ejecutar  │                │ • Proyectar │
│ • Almacenar │                │ • Cachear   │
└─────────────┘                └─────────────┘
       │                              │
       v                              v
┌─────────────┐    Eventos     ┌─────────────┐
│ Event Store │ ──────────────▶│ Read Models │
└─────────────┘               └─────────────┘
```

### Patrón Event Sourcing
- **Event Store**: Secuencia inmutable de eventos de dominio
- **Snapshots**: Snapshots periódicos de estado para rendimiento
- **Replay**: Capacidad de reconstruir estado desde eventos
- **Viaje en el Tiempo**: Consultar estado del sistema en cualquier punto en el tiempo

## Arquitectura de Seguridad

#### Autenticación y Autorización
- **Proveedor de Identidad**: Keycloak con OpenID Connect
- **Implementación RBAC**: Control de acceso basado en roles
- **Tokens JWT**: Autenticación sin estado
- **Seguridad API**: OAuth 2.0 + OpenID Connect

## Observabilidad y Monitoreo

### Implementación OpenTelemetry
- **Trazado Distribuido**: Seguimiento de requests end-to-end
- **Colección de Métricas**: Métricas de rendimiento y negocio
- **Logging**: Logging estructurado con IDs de correlación
- **Integración APM**: Monitoreo de rendimiento de aplicaciones

## Consideraciones de Escalabilidad

### Escalado Horizontal
- **Servicios Sin Estado**: Todos los servicios diseñados para escalado horizontal
- **Sharding de Base de Datos**: Particionar datos a través de múltiples bases de datos
- **Integración CDN**: Entrega global de contenido
- **Auto-escalado**: HPA y VPA de Kubernetes

### Optimización de Rendimiento
- **Estrategia de Caché**: Caché multinivel (Redis, CDN, Aplicación)
- **Connection Pooling**: Optimización de conexiones de base de datos
- **Procesamiento Asíncrono**: Procesamiento de trabajos en segundo plano
- **Read Replicas**: Escalado de lectura de base de datos

## Recuperación ante Desastres

### Estrategia de Respaldo
- **Respaldos de Base de Datos**: Respaldos automáticos diarios con recuperación point-in-time
- **Object Storage**: Replicación cross-region
- **Respaldos de Configuración**: Almacenamiento de Infrastructure as Code
- **Respaldos de Event Store**: Preservación completa de rastro de auditoría

### Alta Disponibilidad
- **Despliegue Multi-AZ**: Servicios distribuidos a través de zonas de disponibilidad
- **Health Checks**: Mecanismos automatizados de failover
- **Circuit Breakers**: Patrones de resistencia de servicios
- **Degradación Gradual**: Funcionalidad parcial durante interrupciones

---

*Este documento de arquitectura proporciona la fundación para decisiones de implementación técnica y asegura alineación con objetivos de negocio mientras mantiene atributos de calidad del sistema.*