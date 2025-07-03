# Access Service - Guía de Implementación de Groups

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Sistema de Jerarquía de Grupos](#sistema-de-jerarquía-de-grupos)
3. [Referencia de API](#referencia-de-api)
4. [Detalles de Implementación](#detalles-de-implementación)
5. [Esquema de Base de Datos](#esquema-de-base-de-datos)
6. [Guía de Testing](#guía-de-testing)
7. [Consideraciones de Rendimiento](#consideraciones-de-rendimiento)
8. [Mejores Prácticas](#mejores-prácticas)

## 🎯 Descripción General

La **Implementación de Groups** en el Access Service proporciona un sistema completo de gestión jerárquica de grupos con profundidad ilimitada, herencia de permisos y escalabilidad de grado empresarial. Esta implementación sigue los patrones **CQRS + DDD + Event Sourcing** para máxima flexibilidad y auditabilidad.

### Características Clave ⭐

- **🏗️ Estructura Jerárquica**: Relaciones padre-hijo de profundidad ilimitada
- **👥 Gestión de Usuarios**: Asignaciones individuales y masivas de usuarios
- **🔐 Herencia de Permisos**: Propagación automática de permisos a través de la jerarquía
- **🛡️ Sistema DefaultGroup**: Asignación automática de usuarios al grupo por defecto
- **🔍 Consultas Avanzadas**: Ancestros, descendientes, hermanos, rutas, niveles
- **📊 Analytics y Búsqueda**: Estadísticas de grupos, monitoreo y capacidades de búsqueda
- **⚡ Alto Rendimiento**: Patrón materialized path para consultas de descendientes O(1)
- **🧪 Testing Completo**: Cobertura de testing unitario, de integración y de API

## 🏗️ Sistema de Jerarquía de Grupos

### Estructura Jerárquica

```
Organización (Raíz)
├── Ingeniería
│   ├── Equipo Frontend
│   │   ├── Desarrolladores React
│   │   └── Desarrolladores Angular
│   └── Equipo Backend
│       ├── Equipo Node.js
│       └── Equipo Python
├── Marketing
│   ├── Marketing Digital
│   └── Marketing de Contenido
└── Ventas
    ├── Ventas Empresariales
    └── Ventas PYME
```

### Sistema DefaultGroup

Cada usuario **debe** pertenecer al **DefaultGroup** especial:
- Creado automáticamente durante la inicialización del sistema
- No puede ser eliminado o modificado
- Todos los nuevos usuarios son asignados automáticamente a él
- Proporciona permisos básicos para todos los usuarios

### Modelo de Herencia de Permisos

```
Permisos Efectivos del Usuario = 
  Permisos Directos de Rol + 
  Permisos Directos de Grupo + 
  Permisos Heredados de Grupos (de grupos padre)
```

**Ejemplo**:
- Usuario pertenece al grupo "Desarrolladores React"
- "Desarrolladores React" → "Equipo Frontend" → "Ingeniería" → "Organización"
- Usuario hereda permisos de TODOS los grupos en la jerarquía

## 🌐 Referencia de API

### URL Base
```
http://localhost:3000/api/v1/groups
```

### Autenticación
Todos los endpoints requieren **token JWT Bearer** en el header Authorization.

### Endpoints Principales

#### Operaciones CRUD de Grupos
```http
# Crear nuevo grupo
POST /api/v1/groups
Content-Type: application/json
{
  "name": "Equipo Frontend",
  "description": "Equipo de desarrollo frontend",
  "parentId": "engineering-group-id",
  "isActive": true,
  "metadata": {
    "type": "team",
    "department": "engineering"
  }
}

# Obtener grupo por ID
GET /api/v1/groups/{groupId}

# Actualizar grupo
PUT /api/v1/groups/{groupId}
Content-Type: application/json
{
  "name": "Nombre de Grupo Actualizado",
  "description": "Descripción actualizada"
}

# Eliminar grupo (eliminación suave)
DELETE /api/v1/groups/{groupId}?reason=Reorganización

# Listar todos los grupos (paginado)
GET /api/v1/groups?page=1&limit=20&includeInactive=false
```

#### Operaciones de Jerarquía
```http
# Obtener árbol de jerarquía completo
GET /api/v1/groups/hierarchy/tree

# Obtener ancestros del grupo (cadena padre)
GET /api/v1/groups/{groupId}/ancestors

# Obtener descendientes del grupo (todos los hijos)
GET /api/v1/groups/{groupId}/descendants

# Obtener solo hijos directos
GET /api/v1/groups/{groupId}/children

# Mover grupo a nuevo padre
PATCH /api/v1/groups/{groupId}/move
Content-Type: application/json
{
  "newParentId": "new-parent-group-id"
}

# Obtener ruta del grupo (breadcrumb)
GET /api/v1/groups/{groupId}/path
```

#### Gestión de Usuarios
```http
# Obtener todos los usuarios en el grupo
GET /api/v1/groups/{groupId}/users

# Añadir usuario al grupo
POST /api/v1/groups/{groupId}/users/{userId}

# Remover usuario del grupo
DELETE /api/v1/groups/{groupId}/users/{userId}

# Añadir usuarios masivamente al grupo
POST /api/v1/groups/{groupId}/users/bulk
Content-Type: application/json
{
  "userIds": ["user-1", "user-2", "user-3"]
}

# Obtener grupos del usuario
GET /api/v1/users/{userId}/groups
```

#### Gestión de Permisos
```http
# Obtener permisos del grupo (con herencia)
GET /api/v1/groups/{groupId}/permissions?includeInherited=true

# Asignar permiso al grupo
POST /api/v1/groups/{groupId}/permissions/{permissionName}

# Remover permiso del grupo
DELETE /api/v1/groups/{groupId}/permissions/{permissionName}

# Asignar permisos masivamente
POST /api/v1/groups/{groupId}/permissions/bulk
Content-Type: application/json
{
  "permissionNames": ["READ_USERS", "WRITE_USERS", "DELETE_USERS"]
}

# Obtener permisos efectivos del usuario (de todos los grupos)
GET /api/v1/users/{userId}/effective-permissions
```

#### Búsqueda y Analytics
```http
# Buscar grupos
GET /api/v1/groups/search?term=engineering&includeInactive=false

# Obtener solo grupos activos
GET /api/v1/groups/active

# Obtener grupo por defecto
GET /api/v1/groups/default

# Obtener estadísticas del grupo
GET /api/v1/groups/{groupId}/stats

# Obtener información completa del grupo
GET /api/v1/groups/{groupId}/full-info
```

#### Gestión de Activación
```http
# Activar grupo
PATCH /api/v1/groups/{groupId}/activate

# Desactivar grupo
PATCH /api/v1/groups/{groupId}/deactivate?reason=Suspensión temporal
```

### Formatos de Respuesta

#### Respuesta Estándar de Grupo
```json
{
  "success": true,
  "data": {
    "id": "group-uuid",
    "name": "Equipo Frontend",
    "description": "Equipo de desarrollo frontend",
    "isActive": true,
    "isDefault": false,
    "parentId": "engineering-group-id",
    "mpath": "1.2.3.",
    "metadata": {
      "type": "team",
      "department": "engineering"
    },
    "createdAt": "2025-01-03T10:00:00Z",
    "updatedAt": "2025-01-03T10:00:00Z",
    "children": [],
    "users": [],
    "permissions": []
  },
  "timestamp": "2025-01-03T10:00:00Z"
}
```

#### Respuesta de Jerarquía
```json
{
  "success": true,
  "data": [
    {
      "id": "root-group-id",
      "name": "Organización",
      "level": 0,
      "children": [
        {
          "id": "engineering-group-id",
          "name": "Ingeniería",
          "level": 1,
          "children": [
            {
              "id": "frontend-group-id",
              "name": "Equipo Frontend",
              "level": 2,
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

#### Respuesta de Estadísticas de Grupo
```json
{
  "success": true,
  "data": {
    "groupId": "group-uuid",
    "userCount": 15,
    "directUserCount": 8,
    "inheritedUserCount": 7,
    "permissionCount": 12,
    "directPermissionCount": 5,
    "inheritedPermissionCount": 7,
    "childrenCount": 3,
    "descendantsCount": 8,
    "level": 2,
    "maxDepth": 5,
    "isLeaf": false,
    "path": "Organización > Ingeniería > Equipo Frontend"
  }
}
```

## 🔧 Detalles de Implementación

### Implementación del Patrón CQRS

#### Commands (13 implementados)
```typescript
// Comandos de gestión de grupos
CreateGroupCommand
UpdateGroupCommand
DeleteGroupCommand
ActivateGroupCommand
DeactivateGroupCommand

// Comandos de jerarquía
SetGroupParentCommand
RemoveGroupParentCommand

// Comandos de gestión de usuarios
AddUserToGroupCommand
RemoveUserFromGroupCommand

// Comandos de gestión de permisos
AssignPermissionToGroupCommand
RemovePermissionFromGroupCommand

// Comandos especiales
CreateDefaultGroupCommand
EnsureUserInDefaultGroupCommand
```

#### Queries (16 implementados)
```typescript
// Consultas básicas
GetGroupByIdQuery
GetGroupByNameQuery
GetGroupsQuery
GetActiveGroupsQuery
GetDefaultGroupQuery

// Consultas de jerarquía
GetGroupHierarchyQuery
GetGroupTreeQuery
GetRootGroupsQuery
GetGroupChildrenQuery
GetGroupAncestorsQuery
GetGroupDescendantsQuery
GetGroupPathQuery

// Consultas de relaciones
GetGroupUsersQuery
GetUserGroupsQuery
GetGroupPermissionsQuery
GetGroupsByPermissionQuery

// Consultas de analytics
SearchGroupsQuery
GetGroupStatisticsQuery
CheckGroupHierarchyQuery
```

### Eventos de Dominio (10 implementados)
```typescript
GroupCreatedEvent
GroupUpdatedEvent
GroupDeletedEvent
GroupActivatedEvent
GroupDeactivatedEvent
GroupParentChangedEvent
UserAddedToGroupEvent
UserRemovedFromGroupEvent
PermissionAssignedToGroupEvent
PermissionRemovedFromGroupEvent
```

### Servicios de Aplicación
```typescript
// Servicio principal de orquestación
GroupApplicationService
├── Orquestación de comandos (13 operaciones)
├── Orquestación de consultas (16 operaciones)
├── Coordinación de lógica de negocio
├── Gestión de transacciones
├── Manejo de errores
└── Publicación de eventos
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### groups
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  mpath VARCHAR(255), -- Materialized path para jerarquía
  parent_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  created_by UUID,
  updated_by UUID
);
```

#### user_groups (Muchos-a-Muchos)
```sql
CREATE TABLE user_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, group_id)
);
```

#### group_permissions (Muchos-a-Muchos)
```sql
CREATE TABLE group_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, permission_id)
);
```

### Índices Optimizados

#### Índices de Rendimiento
```sql
-- Navegación de jerarquía
CREATE INDEX IDX_groups_mpath ON groups (mpath);
CREATE INDEX IDX_groups_parent_id ON groups (parent_id);

-- Filtrado de grupos activos
CREATE INDEX IDX_groups_active_hierarchy 
ON groups (is_active, parent_id, mpath) 
WHERE deleted_at IS NULL;

-- Optimización de búsqueda
CREATE INDEX IDX_groups_name_lower 
ON groups (LOWER(name)) 
WHERE deleted_at IS NULL;

-- Búsqueda de texto completo
CREATE INDEX IDX_groups_search_vector 
ON groups USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, ''))) 
WHERE deleted_at IS NULL;

-- Índices de relaciones
CREATE INDEX IDX_user_groups_user_id ON user_groups (user_id);
CREATE INDEX IDX_user_groups_group_id ON user_groups (group_id);
CREATE INDEX IDX_user_groups_active ON user_groups (user_id, group_id) WHERE is_active = true;

CREATE INDEX IDX_group_permissions_group_id ON group_permissions (group_id);
CREATE INDEX IDX_group_permissions_permission_id ON group_permissions (permission_id);
CREATE INDEX IDX_group_permissions_active ON group_permissions (group_id, permission_id) WHERE is_active = true;
```

## 🧪 Guía de Testing

### Colección Postman
Importa la colección **Access Service Groups API**: `access-service-groups-api.postman_collection.json`

#### Variables de Entorno
```json
{
  "baseUrl": "http://localhost:3000",
  "authToken": "tu-jwt-token-aquí",
  "groupId": "test-group-uuid",
  "parentGroupId": "parent-group-uuid",
  "userId": "test-user-uuid",
  "permissionName": "READ_USERS"
}
```

### Escenarios de Testing

#### 1. Flujo Básico de Gestión de Grupos
```bash
# 1. Crear grupo raíz
POST /api/v1/groups
{
  "name": "Ingeniería",
  "description": "Departamento de Ingeniería"
}

# 2. Crear grupo hijo
POST /api/v1/groups
{
  "name": "Equipo Frontend",
  "description": "Equipo de Desarrollo Frontend",
  "parentId": "<engineering-group-id>"
}

# 3. Añadir usuarios al grupo
POST /api/v1/groups/<frontend-group-id>/users/bulk
{
  "userIds": ["user-1", "user-2", "user-3"]
}

# 4. Asignar permisos
POST /api/v1/groups/<frontend-group-id>/permissions/bulk
{
  "permissionNames": ["READ_CODE", "WRITE_CODE", "DEPLOY_FRONTEND"]
}

# 5. Verificar jerarquía
GET /api/v1/groups/hierarchy/tree

# 6. Verificar permisos de usuario
GET /api/v1/users/user-1/effective-permissions
```

#### 2. Testing de Navegación de Jerarquía
```bash
# Probar cadena de ancestros
GET /api/v1/groups/<group-id>/ancestors

# Probar árbol de descendientes
GET /api/v1/groups/<group-id>/descendants

# Probar breadcrumb de ruta
GET /api/v1/groups/<group-id>/path

# Probar movimiento de grupos
PATCH /api/v1/groups/<group-id>/move
{
  "newParentId": "<new-parent-id>"
}
```

#### 3. Testing de Herencia de Permisos
```bash
# 1. Crear jerarquía de 3 niveles
Organización → Ingeniería → Equipo Frontend

# 2. Asignar permisos en cada nivel
# Organización: ADMIN_ACCESS
# Ingeniería: ENGINEER_ACCESS  
# Equipo Frontend: FRONTEND_ACCESS

# 3. Añadir usuario al Equipo Frontend
# 4. Verificar que el usuario tiene los 3 permisos heredados
GET /api/v1/users/<user-id>/effective-permissions

# Esperado: ADMIN_ACCESS + ENGINEER_ACCESS + FRONTEND_ACCESS
```

### Validaciones de Tests Automatizados

Cada request de Postman incluye tests automatizados:

```javascript
// Validación de código de estado
pm.test('Código de estado es 200', function () {
    pm.response.to.have.status(200);
});

// Validación de estructura de respuesta
pm.test('Respuesta tiene propiedades requeridas', function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('success');
    pm.expect(responseJson).to.have.property('data');
    pm.expect(responseJson).to.have.property('timestamp');
});

// Validación de lógica de negocio
pm.test('Jerarquía de grupo es válida', function () {
    const responseJson = pm.response.json();
    if (responseJson.data.parentId) {
        pm.expect(responseJson.data.mpath).to.include('.');
    }
});

// Validación de rendimiento
pm.test('Tiempo de respuesta es aceptable', function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});
```

## ⚡ Consideraciones de Rendimiento

### Patrón Materialized Path

**Enfoque Recursivo Tradicional** (Lento):
```sql
-- Consulta recursiva O(n)
WITH RECURSIVE group_tree AS (
  SELECT * FROM groups WHERE id = $1
  UNION ALL
  SELECT g.* FROM groups g
  JOIN group_tree gt ON g.parent_id = gt.id
)
SELECT * FROM group_tree;
```

**Enfoque Materialized Path** (Rápido):
```sql
-- Consulta de descendientes O(1)
SELECT * FROM groups 
WHERE mpath LIKE '1.2.3.%' 
AND mpath != '1.2.3.';
```

### Estrategia de Caching

#### Caching con Redis
```typescript
// Cache de jerarquías frecuentemente accedidas
const cacheKey = `group:hierarchy:${rootGroupId}`;
const cachedHierarchy = await redis.get(cacheKey);

if (!cachedHierarchy) {
  const hierarchy = await this.buildHierarchy(rootGroupId);
  await redis.setex(cacheKey, 300, JSON.stringify(hierarchy)); // TTL 5 min
  return hierarchy;
}

return JSON.parse(cachedHierarchy);
```

#### Invalidación de Cache
```typescript
// Invalidar cache cuando la jerarquía cambia
async onGroupMoved(event: GroupParentChangedEvent) {
  const patterns = [
    `group:hierarchy:*`,
    `group:ancestors:${event.groupId}`,
    `group:descendants:${event.oldParentId}`,
    `group:descendants:${event.newParentId}`
  ];
  
  await this.redis.deleteByPattern(patterns);
}
```

### Optimización de Consultas

#### Operaciones Masivas
```typescript
// Asignación eficiente masiva de usuarios
async bulkAddUsersToGroup(groupId: string, userIds: string[]) {
  // Un solo insert por lotes en lugar de inserts individuales
  return await this.userGroupRepository
    .createQueryBuilder()
    .insert()
    .into(UserGroupEntity)
    .values(userIds.map(userId => ({
      userId,
      groupId,
      assignedAt: new Date(),
      isActive: true
    })))
    .execute();
}
```

#### Uso de Índices
```sql
-- Usar índices de cobertura para consultas comunes
CREATE INDEX IDX_user_groups_covering 
ON user_groups (user_id, group_id, is_active, assigned_at)
WHERE deleted_at IS NULL;
```

## 📋 Mejores Prácticas

### 1. Diseño de Jerarquía
- **Limitar Profundidad**: Mantener profundidad de jerarquía razonable (máx 7-8 niveles)
- **Estructura Lógica**: Reflejar la estructura organizacional
- **Evitar Ciclos**: El sistema previene referencias circulares
- **DefaultGroup**: Nunca eliminar o modificar el grupo por defecto

### 2. Estrategia de Permisos
- **Principio de Menor Privilegio**: Asignar permisos mínimos necesarios
- **Planificación de Herencia**: Diseñar jerarquía con herencia de permisos en mente
- **Agrupación de Permisos**: Agrupar permisos relacionados lógicamente
- **Auditorías Regulares**: Revisar periódicamente asignaciones de permisos

### 3. Optimización de Rendimiento
- **Usar Operaciones Masivas**: Para asignaciones masivas de usuarios/permisos
- **Cache de Jerarquías**: Cachear árboles de grupos frecuentemente accedidos
- **Optimizar Consultas**: Usar materialized path para navegación de jerarquía
- **Monitorear Rendimiento**: Rastrear rendimiento de consultas y profundidad de jerarquía

### 4. Uso de API
- **Paginación**: Siempre usar paginación para endpoints de lista
- **Incluir Filtros**: Usar filtros para reducir tamaño de respuesta
- **Operaciones por Lotes**: Usar endpoints masivos para múltiples operaciones
- **Manejo de Errores**: Implementar manejo apropiado de errores y reintentos

### 5. Consideraciones de Seguridad
- **Autenticación**: Siempre requerir tokens JWT válidos
- **Autorización**: Verificar permisos de usuario para cada operación
- **Validación de Entrada**: Validar todos los parámetros de entrada
- **Rastro de Auditoría**: Event sourcing proporciona rastro de auditoría completo

## 🔗 Documentación Relacionada

- [Guía de Implementación CQRS](../../libs/access-service/CQRS-IMPLEMENTATION.md)
- [Documentación de Colección de API](../../postman-collection/README.md)
- [Arquitectura del Sistema](./architecture.md)
- [Guía de Desarrollo](./development.md)

---

**Versión**: 1.0.0  
**Fecha**: 3 de Enero, 2025  
**Compatibilidad**: Access Service v2.0.0+

**Construido con ❤️ para gestión empresarial de grupos**