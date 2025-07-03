# Índice de Documentación - Español

Bienvenido a la documentación de la Enterprise Commerce Platform. Esta página proporciona acceso rápido a toda la documentación disponible en español.

## 📚 Documentación Principal

### 🚀 Primeros Pasos
- [**Guía de Desarrollo**](./development.md) - Instrucciones completas de configuración y desarrollo
- [**Guía de Contribución**](./contributing.md) - Cómo contribuir al proyecto
- [**FAQ**](./faq.md) - Preguntas frecuentes y respuestas

### 🏗️ Arquitectura y Diseño
- [**Arquitectura del Sistema**](./architecture.md) - Arquitectura técnica y patrones de diseño
- [**Objetivos Funcionales**](./functional-objectives.md) - Requisitos detallados del sistema y objetivos de negocio
- [**Estado del Proyecto**](./project-status.md) - Estado actual de implementación y hoja de ruta de desarrollo

### 🛠️ Operaciones y Soporte
- [**Guía de Resolución de Problemas**](./troubleshooting.md) - Guía comprensiva para resolver problemas
- [**Política de Seguridad**](../SECURITY-ES.md) - Reporte de vulnerabilidades y mejores prácticas

### 📋 Información del Proyecto
- [**Resumen del MVP**](../MVP-SUMMARY.md) - Descripción funcional completa del MVP y logros
- [**Changelog**](../CHANGELOG.md) - Historial completo de versiones y notas de lanzamiento
- [**Licencia**](../LICENSE) - Términos de la Licencia MIT

## 🌍 Otros Idiomas

- [**English (Inglés)**](../en/README.md) - Documentation in English

## 🔗 Recursos Externos

### Documentación Específica de Servicios
- [**Implementación Products Service**](../../libs/products-service/PRODUCTS-SERVICE-IMPLEMENTATION.md) - Documentación completa CQRS del Products Service
- [**CQRS Access Service**](../../libs/access-service/CQRS-IMPLEMENTATION.md) - Documentación completa CQRS del Access Service ⭐ **ACTUALIZADA**

### Colecciones de API y Testing
- [**Colecciones Postman**](../../postman-collection/README.md) - Colecciones completas de testing para todos los servicios
- [**API Products Service**](../../postman-collection/products-service-testing.postman_collection.json) - Gestión de productos e inventario
- [**API Access Service - Groups**](../../postman-collection/access-service-groups-api.postman_collection.json) - Gestión de grupos y jerarquías ⭐ **NUEVA**

### Herramientas de Desarrollo
- [**Documentación de API**](http://localhost:3000/graphql) - GraphQL Playground (cuando se ejecuta localmente)
- [**Documentación de Código**](http://localhost:8181) - Documentación generada con CompoDock (cuando se ejecuta localmente)

## 🎉 **Estado Actual del Proyecto: MVP Completo + Access Service Mejorado**

### ✅ **Logros del MVP**
- **🔐 Access Service**: **100% completo** con CQRS, seguridad, infraestructura y **gestión completa de grupos** ⭐
- **🛍️ Products Service**: 100% completo con todas las capas implementadas
- **📊 45+ Commands y Queries**: Implementación CQRS completa en ambos servicios (incrementado desde 25+)
- **🏗️ Infraestructura Completa**: Entidades TypeORM, repositorios, migraciones para todos los servicios
- **🌐 APIs REST**: Controladores completos con documentación Swagger para ambos servicios
- **📦 Trazabilidad de Lotes**: Lógica FIFO/FEFO con seguimiento completo de productos
- **👥 Gestión Jerárquica de Grupos**: Sistema completo de grupos recursivos con herencia de usuarios y permisos ⭐
- **⚡ Listo para Producción**: Ambos servicios listos para despliegue empresarial

### 🆕 **Nuevas Funcionalidades del Access Service** ⭐
- **🏗️ Grupos Jerárquicos**: Organización de grupos con profundidad ilimitada y relaciones padre-hijo
- **👥 Gestión de Usuarios**: Asignaciones individuales y masivas de usuarios a grupos
- **🔐 Herencia de Permisos**: Propagación automática de permisos a través de la jerarquía de grupos
- **🔍 Consultas Avanzadas**: Ancestros, descendientes, rutas y cálculos de niveles
- **📊 Analytics de Grupos**: Estadísticas, monitoreo y capacidades de búsqueda
- **🛡️ Sistema DefaultGroup**: Asignación automática de usuarios al grupo por defecto
- **🌐 API REST Completa**: 30+ endpoints para gestión completa de grupos
- **🧪 Cobertura Completa de Tests**: Testing automatizado para todas las operaciones de grupos

### 🚀 **Próxima Fase de Desarrollo**
**Desarrollo del Commerce Service** - Gestión de órdenes con integración del Products Service y Access Service

### 🎯 **Innovaciones Clave Entregadas**
- **Trazabilidad Completa**: Seguimiento Producto → Lote → Orden listo
- **Inventario Inteligente**: Rotación automática FIFO/FEFO
- **Control de Acceso Jerárquico**: Grupos → Usuarios → Permisos con herencia ⭐
- **APIs Empresariales**: Endpoints REST con validación y documentación para ambos servicios
- **Arquitectura Escalable**: Implementación CQRS + DDD + TypeORM en todos los servicios

## 📞 Obtener Ayuda

### Soporte de la Comunidad
- **GitHub Issues**: [Preguntas técnicas y reportes de bugs](https://github.com/Ximplicity/enterprise-commerce-platform/issues)
- **GitHub Discussions**: [Preguntas generales e ideas](https://github.com/Ximplicity/enterprise-commerce-platform/discussions)

### Contacto Directo
- **Soporte Técnico**: [support@ximplicity.com](mailto:support@ximplicity.com)
- **Problemas de Seguridad**: [security@ximplicity.com](mailto:security@ximplicity.com)
- **Consultas de Negocio**: [contact@ximplicity.com](mailto:contact@ximplicity.com)

## 🏷️ Estado de la Documentación

| Documento | Estado | Última Actualización |
|-----------|--------|----------------------|
| Guía de Desarrollo | ✅ Completo | 2025-06-20 |
| Guía de Contribución | ✅ Completo | 2025-06-20 |
| Guía de Arquitectura | ✅ Completo | 2025-06-20 |
| Guía de Resolución de Problemas | ✅ Completo | 2025-06-20 |
| FAQ | ✅ Completo | 2025-06-20 |
| Política de Seguridad | ✅ Completo | 2025-06-20 |
| Objetivos Funcionales | ✅ Completo | 2025-06-20 |
| Estado del Proyecto | ✅ Completo | 2025-06-22 |
| Resumen del MVP | ✅ Completo | 2025-06-22 |
| **CQRS Access Service** | ✅ **Completo** | **2025-01-03** ⭐ |
| **API Groups Access Service** | ✅ **Completo** | **2025-01-03** ⭐ |

## 🚀 Comandos de Inicio Rápido

```bash
# Clonar e instalar dependencias
git clone <repository-url>
cd enterprise-commerce-platform
npm install

# Iniciar servicios de infraestructura
docker-compose up -d mysql redis redis-bullmq minio keycloak

# Iniciar entorno de desarrollo
npm run dev

# Probar todos los servicios completados
nx test access-service
nx test products-service

# Construir todos los servicios
nx build access-service
nx build products-service

# Probar APIs con Colecciones Postman
# Importar colecciones desde ./postman-collection/
# 1. access-service-groups-api.postman_collection.json
# 2. products-service-testing.postman_collection.json
```

## 📊 Descripción Completa de Servicios

### **Access Service** ✅ **Mejorado y Completo**
- **🏗️ Gestión Jerárquica de Grupos**: CRUD completo con jerarquía de profundidad ilimitada
- **👥 Relaciones Usuario-Grupo**: Operaciones de asignación individual y masiva
- **🔐 Gestión Permiso-Grupo**: Control de acceso basado en roles con herencia
- **🔍 Consultas Avanzadas**: 16 consultas especializadas para navegación jerárquica
- **📊 Analytics de Grupos**: Estadísticas, búsqueda y capacidades de monitoreo
- **🛡️ Seguridad y Auditoría**: Implementación CQRS completa con event sourcing
- **🌐 API REST**: 30+ endpoints con documentación Swagger completa
- **🧪 Cobertura de Tests**: Testing completo unitario, de integración y de API

#### **Nuevas Funcionalidades de Gestión de Grupos**:
- **Jerarquía Recursiva**: Los grupos pueden contener otros grupos (profundidad ilimitada)
- **Sistema DefaultGroup**: Todos los usuarios pertenecen automáticamente al grupo por defecto
- **Herencia de Permisos**: Los usuarios heredan permisos de todos sus grupos
- **Operaciones Masivas**: Asignación eficiente masiva de usuarios/permisos
- **Navegación Jerárquica**: Ancestros, descendientes, hermanos, rutas, niveles
- **Búsqueda Avanzada**: Filtrado basado en nombre, descripción, metadata
- **Estadísticas de Grupos**: Conteo de usuarios, permisos, métricas jerárquicas

### **Products Service** ✅ **Completo**
- **📦 Gestión del Ciclo de Vida del Producto**: CRUD completo con jerarquías de familias
- **🔄 Inventario Inteligente**: Lógica FIFO/FEFO con gestión de lotes
- **📊 Sistema de Trazabilidad de Lotes**: Seguimiento y analytics completos de productos
- **📈 Variantes de Paquetes**: Gestión de códigos de barras y especificaciones
- **🌐 API REST Completa**: 31+ endpoints con documentación Swagger
- **🧪 Testing Avanzado**: Colección Postman completa con validación automatizada

## 🔄 Testing de APIs y Colecciones

### **Access Service - API de Groups** ⭐ **NUEVA**
**Colección**: `access-service-groups-api.postman_collection.json`

**Categorías de Endpoints**:
- 📋 **CRUD de Grupos**: Operaciones crear, leer, actualizar, eliminar
- 🏗️ **Gestión Jerárquica**: Operaciones de árbol, relaciones padre-hijo
- 👥 **Gestión de Usuarios**: Asignaciones individuales y masivas de usuarios
- 🔐 **Gestión de Permisos**: Asignaciones individuales y masivas de permisos
- 🔍 **Búsqueda y Analytics**: Búsqueda de grupos, estadísticas, monitoreo
- ⚡ **Control de Activación**: Activación/desactivación de grupos
- 🧪 **Escenarios de Testing**: Validación de flujo end-to-end

**Endpoints Clave**:
```
GET    /api/v1/groups                    # Listar todos los grupos
POST   /api/v1/groups                    # Crear nuevo grupo
GET    /api/v1/groups/{id}               # Obtener grupo por ID
PUT    /api/v1/groups/{id}               # Actualizar grupo
DELETE /api/v1/groups/{id}               # Eliminar grupo
GET    /api/v1/groups/hierarchy/tree     # Obtener árbol jerárquico
GET    /api/v1/groups/{id}/ancestors     # Obtener ancestros del grupo
GET    /api/v1/groups/{id}/descendants   # Obtener descendientes del grupo
POST   /api/v1/groups/{id}/users/{userId} # Añadir usuario al grupo
POST   /api/v1/groups/{id}/users/bulk    # Añadir usuarios masivamente
GET    /api/v1/groups/{id}/permissions   # Obtener permisos del grupo
GET    /api/v1/groups/default            # Obtener grupo por defecto
GET    /api/v1/groups/search             # Buscar grupos
```

### **API Products Service** ✅ **Mejorada**
**Colección**: `products-service-testing.postman_collection.json`

**Funcionalidades**: Inventario FIFO/FEFO, trazabilidad de lotes, analytics, 31+ endpoints

## 🔧 Ejemplos de Integración

### **Jerarquía de Grupos con Gestión de Usuarios**:
```typescript
// Crear grupos jerárquicos
const engineering = await groupService.createGroup({
  name: 'Ingeniería',
  description: 'Departamento de Ingeniería'
});

const frontend = await groupService.createGroup({
  name: 'Equipo Frontend',
  description: 'Equipo de Desarrollo Frontend',
  parentId: engineering.id
});

// Añadir usuarios masivamente al equipo
await groupService.bulkAddUsersToGroup(frontend.id, [
  'user-1', 'user-2', 'user-3'
]);

// Asignar permisos con herencia
await groupService.bulkAssignPermissionsToGroup(frontend.id, [
  'READ_CODE', 'WRITE_CODE', 'DEPLOY_FRONTEND'
]);

// Los usuarios en el equipo frontend heredan automáticamente permisos de ingeniería
const userPermissions = await groupService.getUserEffectivePermissions('user-1');
```

### **Flujo Completo de Testing de API**:
```bash
# 1. Importar colecciones Postman
# 2. Configurar variables de entorno
{
  \"baseUrl\": \"http://localhost:3000\",
  \"authToken\": \"tu-jwt-token\"
}

# 3. Ejecutar test completo de gestión de grupos
# - Crear jerarquía de grupos
# - Añadir usuarios y permisos  
# - Verificar herencia
# - Probar navegación jerárquica
# - Validar analytics
```

## 🎯 **Lista de Verificación para Producción**

### ✅ **Access Service**
- [x] **Implementación CQRS**: 13 Commands + 16 Queries
- [x] **Entidades de Dominio**: Group, User, Permission con relaciones
- [x] **Infraestructura**: Entidades TypeORM, repositorios, migraciones
- [x] **Capa de API**: 30+ endpoints REST con Swagger
- [x] **Event Sourcing**: Rastro de auditoría completo
- [x] **Testing**: Tests unitarios, de integración y de API
- [x] **Seguridad**: Autenticación JWT, autorización basada en roles
- [x] **Base de Datos**: Scripts de migración y datos semilla
- [x] **Documentación**: Documentación completa CQRS y de API

### ✅ **Products Service**
- [x] **Implementación CQRS**: Completa con inventario avanzado
- [x] **Lógica FIFO/FEFO**: Gestión inteligente de lotes
- [x] **Trazabilidad**: Seguimiento completo de productos
- [x] **Capa de API**: 31+ endpoints REST
- [x] **Testing**: Colección Postman completa
- [x] **Documentación**: Guía completa de implementación

---

**¿Necesitas actualizar la documentación?** Por favor consulta nuestra [Guía de Contribución](./contributing.md) para estándares de documentación y proceso de envío.

**¿Encontraste un problema?** Por favor reporta problemas de documentación usando nuestro [Template de Issue de Documentación](../.github/ISSUE_TEMPLATE/documentation.md).

**¿Quieres probar las APIs?** Importa nuestras [Colecciones Postman](../../postman-collection/README.md) para testing completo de APIs.

---

*Esta documentación se mantiene y actualiza continuamente. Para la última versión, siempre consulta la rama main.*

*Última Actualización: 3 de Enero, 2025 - Implementación Completa de Groups en Access Service*