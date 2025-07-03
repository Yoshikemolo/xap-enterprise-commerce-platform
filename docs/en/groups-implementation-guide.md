# Access Service - Groups Implementation Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Group Hierarchy System](#group-hierarchy-system)
3. [API Reference](#api-reference)
4. [Implementation Details](#implementation-details)
5. [Database Schema](#database-schema)
6. [Testing Guide](#testing-guide)
7. [Performance Considerations](#performance-considerations)
8. [Best Practices](#best-practices)

## 🎯 Overview

The **Groups Implementation** in the Access Service provides a comprehensive hierarchical group management system with unlimited depth, permission inheritance, and enterprise-grade scalability. This implementation follows **CQRS + DDD + Event Sourcing** patterns for maximum flexibility and auditability.

### Key Features ⭐

- **🏗️ Hierarchical Structure**: Unlimited depth parent-child relationships
- **👥 User Management**: Individual and bulk user assignments
- **🔐 Permission Inheritance**: Automatic permission propagation through hierarchy
- **🛡️ DefaultGroup System**: Automatic user assignment to default group
- **🔍 Advanced Queries**: Ancestors, descendants, siblings, paths, levels
- **📊 Analytics & Search**: Group statistics, monitoring, and search capabilities
- **⚡ High Performance**: Materialized path pattern for O(1) descendant queries
- **🧪 Complete Testing**: Unit, integration, and API testing coverage

## 🏗️ Group Hierarchy System

### Hierarchy Structure

```
Organization (Root)
├── Engineering
│   ├── Frontend Team
│   │   ├── React Developers
│   │   └── Angular Developers
│   └── Backend Team
│       ├── Node.js Team
│       └── Python Team
├── Marketing
│   ├── Digital Marketing
│   └── Content Marketing
└── Sales
    ├── Enterprise Sales
    └── SMB Sales
```

### DefaultGroup System

Every user **must** belong to the special **DefaultGroup**:
- Created automatically during system initialization
- Cannot be deleted or modified
- All new users are automatically assigned to it
- Provides baseline permissions for all users

### Permission Inheritance Model

```
User Effective Permissions = 
  Direct Role Permissions + 
  Direct Group Permissions + 
  Inherited Group Permissions (from parent groups)
```

**Example**:
- User belongs to "React Developers" group
- "React Developers" → "Frontend Team" → "Engineering" → "Organization"
- User inherits permissions from ALL groups in the hierarchy

## 🌐 API Reference

### Base URL
```
http://localhost:3000/api/v1/groups
```

### Authentication
All endpoints require **JWT Bearer token** in Authorization header.

### Main Endpoints

#### Group CRUD Operations
```http
# Create new group
POST /api/v1/groups
Content-Type: application/json
{
  "name": "Frontend Team",
  "description": "Frontend development team",
  "parentId": "engineering-group-id",
  "isActive": true,
  "metadata": {
    "type": "team",
    "department": "engineering"
  }
}

# Get group by ID
GET /api/v1/groups/{groupId}

# Update group
PUT /api/v1/groups/{groupId}
Content-Type: application/json
{
  "name": "Updated Group Name",
  "description": "Updated description"
}

# Delete group (soft delete)
DELETE /api/v1/groups/{groupId}?reason=Reorganization

# List all groups (paginated)
GET /api/v1/groups?page=1&limit=20&includeInactive=false
```

#### Hierarchy Operations
```http
# Get complete hierarchy tree
GET /api/v1/groups/hierarchy/tree

# Get group ancestors (parent chain)
GET /api/v1/groups/{groupId}/ancestors

# Get group descendants (all children)
GET /api/v1/groups/{groupId}/descendants

# Get direct children only
GET /api/v1/groups/{groupId}/children

# Move group to new parent
PATCH /api/v1/groups/{groupId}/move
Content-Type: application/json
{
  "newParentId": "new-parent-group-id"
}

# Get group path (breadcrumb)
GET /api/v1/groups/{groupId}/path
```

#### User Management
```http
# Get all users in group
GET /api/v1/groups/{groupId}/users

# Add user to group
POST /api/v1/groups/{groupId}/users/{userId}

# Remove user from group
DELETE /api/v1/groups/{groupId}/users/{userId}

# Bulk add users to group
POST /api/v1/groups/{groupId}/users/bulk
Content-Type: application/json
{
  "userIds": ["user-1", "user-2", "user-3"]
}

# Get user's groups
GET /api/v1/users/{userId}/groups
```

#### Permission Management
```http
# Get group permissions (with inheritance)
GET /api/v1/groups/{groupId}/permissions?includeInherited=true

# Assign permission to group
POST /api/v1/groups/{groupId}/permissions/{permissionName}

# Remove permission from group
DELETE /api/v1/groups/{groupId}/permissions/{permissionName}

# Bulk assign permissions
POST /api/v1/groups/{groupId}/permissions/bulk
Content-Type: application/json
{
  "permissionNames": ["READ_USERS", "WRITE_USERS", "DELETE_USERS"]
}

# Get user's effective permissions (from all groups)
GET /api/v1/users/{userId}/effective-permissions
```

#### Search & Analytics
```http
# Search groups
GET /api/v1/groups/search?term=engineering&includeInactive=false

# Get active groups only
GET /api/v1/groups/active

# Get default group
GET /api/v1/groups/default

# Get group statistics
GET /api/v1/groups/{groupId}/stats

# Get complete group information
GET /api/v1/groups/{groupId}/full-info
```

#### Activation Management
```http
# Activate group
PATCH /api/v1/groups/{groupId}/activate

# Deactivate group
PATCH /api/v1/groups/{groupId}/deactivate?reason=Temporary suspension
```

### Response Formats

#### Standard Group Response
```json
{
  "success": true,
  "data": {
    "id": "group-uuid",
    "name": "Frontend Team",
    "description": "Frontend development team",
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

#### Hierarchy Response
```json
{
  "success": true,
  "data": [
    {
      "id": "root-group-id",
      "name": "Organization",
      "level": 0,
      "children": [
        {
          "id": "engineering-group-id",
          "name": "Engineering",
          "level": 1,
          "children": [
            {
              "id": "frontend-group-id",
              "name": "Frontend Team",
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

#### Group Statistics Response
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
    "path": "Organization > Engineering > Frontend Team"
  }
}
```

## 🔧 Implementation Details

### CQRS Pattern Implementation

#### Commands (13 implemented)
```typescript
// Group management commands
CreateGroupCommand
UpdateGroupCommand
DeleteGroupCommand
ActivateGroupCommand
DeactivateGroupCommand

// Hierarchy commands
SetGroupParentCommand
RemoveGroupParentCommand

// User management commands
AddUserToGroupCommand
RemoveUserFromGroupCommand

// Permission management commands
AssignPermissionToGroupCommand
RemovePermissionFromGroupCommand

// Special commands
CreateDefaultGroupCommand
EnsureUserInDefaultGroupCommand
```

#### Queries (16 implemented)
```typescript
// Basic queries
GetGroupByIdQuery
GetGroupByNameQuery
GetGroupsQuery
GetActiveGroupsQuery
GetDefaultGroupQuery

// Hierarchy queries
GetGroupHierarchyQuery
GetGroupTreeQuery
GetRootGroupsQuery
GetGroupChildrenQuery
GetGroupAncestorsQuery
GetGroupDescendantsQuery
GetGroupPathQuery

// Relationship queries
GetGroupUsersQuery
GetUserGroupsQuery
GetGroupPermissionsQuery
GetGroupsByPermissionQuery

// Analytics queries
SearchGroupsQuery
GetGroupStatisticsQuery
CheckGroupHierarchyQuery
```

### Domain Events (10 implemented)
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

### Application Services
```typescript
// Main orchestration service
GroupApplicationService
├── Command orchestration (13 operations)
├── Query orchestration (16 operations)
├── Business logic coordination
├── Transaction management
├── Error handling
└── Event publishing
```

## 🗄️ Database Schema

### Core Tables

#### groups
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  mpath VARCHAR(255), -- Materialized path for hierarchy
  parent_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  created_by UUID,
  updated_by UUID
);
```

#### user_groups (Many-to-Many)
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

#### group_permissions (Many-to-Many)
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

### Optimized Indexes

#### Performance Indexes
```sql
-- Hierarchy navigation
CREATE INDEX IDX_groups_mpath ON groups (mpath);
CREATE INDEX IDX_groups_parent_id ON groups (parent_id);

-- Active groups filtering
CREATE INDEX IDX_groups_active_hierarchy 
ON groups (is_active, parent_id, mpath) 
WHERE deleted_at IS NULL;

-- Search optimization
CREATE INDEX IDX_groups_name_lower 
ON groups (LOWER(name)) 
WHERE deleted_at IS NULL;

-- Full-text search
CREATE INDEX IDX_groups_search_vector 
ON groups USING gin(to_tsvector('english', name || ' ' || COALESCE(description, ''))) 
WHERE deleted_at IS NULL;

-- Relationship indexes
CREATE INDEX IDX_user_groups_user_id ON user_groups (user_id);
CREATE INDEX IDX_user_groups_group_id ON user_groups (group_id);
CREATE INDEX IDX_user_groups_active ON user_groups (user_id, group_id) WHERE is_active = true;

CREATE INDEX IDX_group_permissions_group_id ON group_permissions (group_id);
CREATE INDEX IDX_group_permissions_permission_id ON group_permissions (permission_id);
CREATE INDEX IDX_group_permissions_active ON group_permissions (group_id, permission_id) WHERE is_active = true;
```

## 🧪 Testing Guide

### Postman Collection
Import the **Access Service Groups API** collection: `access-service-groups-api.postman_collection.json`

#### Environment Variables
```json
{
  "baseUrl": "http://localhost:3000",
  "authToken": "your-jwt-token-here",
  "groupId": "test-group-uuid",
  "parentGroupId": "parent-group-uuid",
  "userId": "test-user-uuid",
  "permissionName": "READ_USERS"
}
```

### Testing Scenarios

#### 1. Basic Group Management Flow
```bash
# 1. Create root group
POST /api/v1/groups
{
  "name": "Engineering",
  "description": "Engineering Department"
}

# 2. Create child group
POST /api/v1/groups
{
  "name": "Frontend Team",
  "description": "Frontend Development Team",
  "parentId": "<engineering-group-id>"
}

# 3. Add users to group
POST /api/v1/groups/<frontend-group-id>/users/bulk
{
  "userIds": ["user-1", "user-2", "user-3"]
}

# 4. Assign permissions
POST /api/v1/groups/<frontend-group-id>/permissions/bulk
{
  "permissionNames": ["READ_CODE", "WRITE_CODE", "DEPLOY_FRONTEND"]
}

# 5. Verify hierarchy
GET /api/v1/groups/hierarchy/tree

# 6. Check user permissions
GET /api/v1/users/user-1/effective-permissions
```

#### 2. Hierarchy Navigation Testing
```bash
# Test ancestor chain
GET /api/v1/groups/<group-id>/ancestors

# Test descendant tree
GET /api/v1/groups/<group-id>/descendants

# Test path breadcrumb
GET /api/v1/groups/<group-id>/path

# Test moving groups
PATCH /api/v1/groups/<group-id>/move
{
  "newParentId": "<new-parent-id>"
}
```

#### 3. Permission Inheritance Testing
```bash
# 1. Create 3-level hierarchy
Organization → Engineering → Frontend Team

# 2. Assign permissions at each level
# Organization: ADMIN_ACCESS
# Engineering: ENGINEER_ACCESS  
# Frontend Team: FRONTEND_ACCESS

# 3. Add user to Frontend Team
# 4. Verify user has all 3 permissions inherited
GET /api/v1/users/<user-id>/effective-permissions

# Expected: ADMIN_ACCESS + ENGINEER_ACCESS + FRONTEND_ACCESS
```

### Automated Test Validations

Each Postman request includes automated tests:

```javascript
// Status code validation
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});

// Response structure validation
pm.test('Response has required properties', function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('success');
    pm.expect(responseJson).to.have.property('data');
    pm.expect(responseJson).to.have.property('timestamp');
});

// Business logic validation
pm.test('Group hierarchy is valid', function () {
    const responseJson = pm.response.json();
    if (responseJson.data.parentId) {
        pm.expect(responseJson.data.mpath).to.include('.');
    }
});

// Performance validation
pm.test('Response time is acceptable', function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});
```

## ⚡ Performance Considerations

### Materialized Path Pattern

**Traditional Recursive Approach** (Slow):
```sql
-- O(n) recursive query
WITH RECURSIVE group_tree AS (
  SELECT * FROM groups WHERE id = $1
  UNION ALL
  SELECT g.* FROM groups g
  JOIN group_tree gt ON g.parent_id = gt.id
)
SELECT * FROM group_tree;
```

**Materialized Path Approach** (Fast):
```sql
-- O(1) descendant query
SELECT * FROM groups 
WHERE mpath LIKE '1.2.3.%' 
AND mpath != '1.2.3.';
```

### Caching Strategy

#### Redis Caching
```typescript
// Cache frequently accessed hierarchies
const cacheKey = `group:hierarchy:${rootGroupId}`;
const cachedHierarchy = await redis.get(cacheKey);

if (!cachedHierarchy) {
  const hierarchy = await this.buildHierarchy(rootGroupId);
  await redis.setex(cacheKey, 300, JSON.stringify(hierarchy)); // 5 min TTL
  return hierarchy;
}

return JSON.parse(cachedHierarchy);
```

#### Cache Invalidation
```typescript
// Invalidate cache when hierarchy changes
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

### Query Optimization

#### Bulk Operations
```typescript
// Efficient bulk user assignment
async bulkAddUsersToGroup(groupId: string, userIds: string[]) {
  // Single batch insert instead of individual inserts
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

#### Index Usage
```sql
-- Use covering indexes for common queries
CREATE INDEX IDX_user_groups_covering 
ON user_groups (user_id, group_id, is_active, assigned_at)
WHERE deleted_at IS NULL;
```

## 📋 Best Practices

### 1. Hierarchy Design
- **Limit Depth**: Keep hierarchy depth reasonable (max 7-8 levels)
- **Logical Structure**: Mirror organizational structure
- **Avoid Cycles**: System prevents circular references
- **DefaultGroup**: Never delete or modify the default group

### 2. Permission Strategy
- **Principle of Least Privilege**: Assign minimal necessary permissions
- **Inheritance Planning**: Design hierarchy with permission inheritance in mind
- **Permission Grouping**: Group related permissions logically
- **Regular Audits**: Periodically review permission assignments

### 3. Performance Optimization
- **Use Bulk Operations**: For mass user/permission assignments
- **Cache Hierarchies**: Cache frequently accessed group trees
- **Optimize Queries**: Use materialized path for hierarchy navigation
- **Monitor Performance**: Track query performance and hierarchy depth

### 4. API Usage
- **Pagination**: Always use pagination for list endpoints
- **Include Filters**: Use filters to reduce response size
- **Batch Operations**: Use bulk endpoints for multiple operations
- **Error Handling**: Implement proper error handling and retries

### 5. Security Considerations
- **Authentication**: Always require valid JWT tokens
- **Authorization**: Verify user permissions for each operation
- **Input Validation**: Validate all input parameters
- **Audit Trail**: Event sourcing provides complete audit trail

## 🔗 Related Documentation

- [CQRS Implementation Guide](../../libs/access-service/CQRS-IMPLEMENTATION.md)
- [API Collection Documentation](../../postman-collection/README.md)
- [System Architecture](./architecture.md)
- [Development Guide](./development.md)

---

**Version**: 1.0.0  
**Date**: January 3, 2025  
**Compatibility**: Access Service v2.0.0+

**Built with ❤️ for enterprise group management**