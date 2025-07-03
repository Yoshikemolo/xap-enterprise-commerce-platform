# Postman Collections for XAP Enterprise Commerce Platform

<!-- Language Selector -->
<div align="center">

**🌐 Choose your language / Elige tu idioma:**

[![English](https://img.shields.io/badge/English-🇺🇸-blue?style=for-the-badge)](#english) | [![Español](https://img.shields.io/badge/Español-🇪🇸-red?style=for-the-badge)](#español)

---

</div>

## English

This directory contains comprehensive Postman collections for testing all APIs in the XAP Enterprise Commerce Platform, including advanced features like FIFO/FEFO algorithms, batch traceability, and enterprise-grade inventory management.

## 📊 Available Collections

### 🛍️ **Products Service - Advanced Testing** ⭐ UPDATED v1.3.0
#### `products-service-advanced-testing.postman_collection.json`
Complete advanced API testing collection for the Products Service with cutting-edge inventory management features:

**🆕 New in v1.3.0:**
- ✅ **Complete Product CRUD**: Enhanced CREATE, UPDATE, DELETE operations
- ✅ **Advanced Stock Operations**: FIFO/FEFO logic implementation with intelligent batch selection
- ✅ **Complete Batch Traceability**: End-to-end tracking with utilization analytics
- ✅ **Enhanced Data Models**: Extended fields (productCode, familyName, isActive, specifications, media, packages, stockSummary)
- ✅ **Automated Bug Fixes**: Resolved req.body undefined issues with comprehensive error handling
- ✅ **31+ Endpoints**: Complete API coverage with 85+ automated validations

**Main Endpoint Categories:**
- 🔍 **Health & Status**: Service monitoring with version validation (v1.1.1)
- 📦 **Products Management**: Enhanced CRUD with extended data structures
- 📊 **Stock Management**: Complete inventory operations with batch support
- 🔄 **Advanced Operations**: FIFO/FEFO algorithms with intelligent selection logic
- 🔍 **Batch Traceability**: Complete tracking with analytics and expiration monitoring
- 📈 **Movements & Audit Trail**: Comprehensive movement tracking and analysis
- ⚠️ **Alerts & Analytics**: Low stock alerts and inventory analytics dashboard
- 🧪 **Advanced Testing Scenarios**: End-to-end testing workflows

### 🛍️ **Products Service - Basic Testing** (Legacy)
#### `products-service-testing.postman_collection.json`
Basic API testing collection maintained for compatibility:

**Features:**
- ✅ **Basic CRUD**: Standard products operations
- ✅ **Simple Stock Operations**: Basic inventory management
- ✅ **Health Monitoring**: Service status checks

*Note: Consider upgrading to Advanced Testing collection for full feature access.*

### 🔐 **Access Service - Groups API** 
#### `access-service-groups-api.postman_collection.json`
Complete API testing collection for Group management in the Access Service with hierarchical organization:

**Key Features:**
- ✅ **Complete Group CRUD**: Create, read, update, delete operations
- ✅ **Hierarchical Management**: Parent-child relationships with unlimited depth
- ✅ **User Management**: Individual and bulk user assignments
- ✅ **Permission Management**: Individual and bulk permission assignments
- ✅ **Advanced Hierarchy Queries**: Ancestors, descendants, paths, levels
- ✅ **Search & Analytics**: Group search, statistics, and monitoring
- ✅ **DefaultGroup Management**: Special default group operations
- ✅ **30+ Endpoints**: Complete CQRS API coverage

**Main Endpoint Categories:**
- 🔍 Health & Status
- 📋 Group CRUD operations
- 🏗️ Hierarchy management (tree operations)
- 👥 User assignments (individual & bulk)
- 🔐 Permission assignments (individual & bulk)
- 🔍 Search & special operations
- ⚡ Activation/deactivation management
- 🧪 Advanced testing scenarios

## 🚀 How to Use

### 1. Import Collections into Postman
1. Open Postman
2. Click **Import**
3. Select the desired `.postman_collection.json` file
4. Collection will be imported with all endpoints configured

### 2. Configure Environment Variables

#### For Products Service Advanced Testing:
```json
{
  \"baseUrl\": \"http://localhost:3333\",
  \"productId\": \"1\",
  \"stockId\": \"1\",
  \"batchNumber\": \"BATCH-2024-001\",
  \"orderId\": \"ORDER-TEST-001\"
}
```

#### For Products Service Basic Testing:
```json
{
  \"baseUrl\": \"http://localhost:3333\",
  \"productId\": \"1\"
}
```

#### For Access Service - Groups API:
```json
{
  \"baseUrl\": \"http://localhost:3000\",
  \"authToken\": \"your-jwt-token-here\",
  \"groupId\": \"group-uuid\",
  \"parentGroupId\": \"parent-group-uuid\",
  \"userId\": \"user-uuid\",
  \"permissionName\": \"permission-name\"
}
```

### 3. Authentication Setup

#### Access Service - Groups API:
1. **Obtain JWT token** from your authentication endpoint
2. **Set authToken variable** in your environment
3. **Bearer token** will be automatically included in all requests

### 4. Run Tests
1. **Start the services:**
   - Products Service: `npm run dev` (port 3333)
   - Access Service: `npm run dev` (port 3000)
2. **Execute requests** individually or run entire collections
3. **Review automated tests** - each request includes comprehensive validations

## 📋 Test Coverage

### Products Service Advanced Tests:
- ✅ **Status Codes**: 200, 201, 204, 404 validations
- ✅ **Data Structure**: Required properties verification with extended schema
- ✅ **Business Logic**: FIFO/FEFO algorithms with smart batch selection
- ✅ **Performance**: Response time monitoring (< 1000ms)
- ✅ **Traceability**: End-to-end tracking validation with analytics
- ✅ **Error Handling**: Comprehensive req.body validation and error responses
- ✅ **Advanced Scenarios**: Complete stock flow testing

### Products Service Basic Tests:
- ✅ **Status Codes**: 200, 201, 404 validations
- ✅ **Data Structure**: Basic properties verification
- ✅ **CRUD Operations**: Standard create, read, update operations

### Access Service - Groups Tests:
- ✅ **Status Codes**: 200, 201, 204, 404, 401, 403 validations
- ✅ **CRUD Operations**: Complete group lifecycle
- ✅ **Hierarchy Logic**: Parent-child relationships
- ✅ **User Management**: Assignment and removal operations
- ✅ **Permission Logic**: Authorization and inheritance
- ✅ **Search Functions**: Query and filter validations
- ✅ **DefaultGroup**: Special group behavior verification

## 🔧 Expected Response Structures

### Products Service (Advanced):
```json
{
  \"success\": true,
  \"message\": \"Operation completed successfully\",
  \"data\": {
    \"id\": 1,
    \"productCode\": \"PROD-001\",
    \"name\": \"Product Name\",
    \"familyName\": \"Product Family\",
    \"isActive\": true,
    \"specifications\": [
      {
        \"key\": \"weight\",
        \"value\": \"2.5\",
        \"unit\": \"kg\"
      }
    ],
    \"media\": [],
    \"packages\": [],
    \"stockSummary\": {
      \"totalQuantity\": 100,
      \"availableQuantity\": 85,
      \"reservedQuantity\": 15
    },
    \"createdAt\": \"2025-01-03T10:02:16.000Z\",
    \"updatedAt\": \"2025-01-03T10:02:16.000Z\"
  },
  \"timestamp\": \"2025-01-03T10:02:16.000Z\"
}
```

### Products Service (Basic):
```json
{
  \"success\": true,
  \"message\": \"Operation completed\",
  \"data\": {...},
  \"timestamp\": \"2025-01-03T10:02:16.000Z\"
}
```

### Access Service - Groups:
```json
{
  \"success\": true,
  \"data\": {
    \"id\": \"uuid\",
    \"name\": \"Group Name\",
    \"description\": \"Group Description\",
    \"isActive\": true,
    \"isDefault\": false,
    \"parentId\": \"parent-uuid\",
    \"metadata\": {...},
    \"createdAt\": \"2025-01-03T10:02:16.000Z\",
    \"updatedAt\": \"2025-01-03T10:02:16.000Z\"
  },
  \"timestamp\": \"2025-01-03T10:02:16.000Z\"
}
```

## 🧪 Recommended Testing Scenarios

### Products Service Advanced Flow:
1. **Basic Product Management**: Create → Read → Update → Delete with extended data
2. **Advanced Stock Flow**: Create stock → Add batches → Reserve (FEFO) → Consume → Verify traceability
3. **FIFO vs FEFO Testing**: Compare algorithmic behavior with different batch dates
4. **Monitoring & Alerts**: Low stock and expiration monitoring with analytics
5. **Complete Flow Test**: End-to-end automated scenario testing

### Products Service Basic Flow:
1. **Basic Product Management**: Create → Read → Update → Delete
2. **Simple Stock Operations**: Basic inventory checks

### Access Service - Groups Flow:
1. **Basic Group Management**: Create → Read → Update → Delete
2. **Hierarchy Testing**: Create parent → Add children → Move groups → Verify relationships
3. **User Management**: Add users → Bulk operations → Remove users
4. **Permission Testing**: Assign permissions → Test inheritance → Remove permissions
5. **Search & Analytics**: Search groups → Get statistics → Monitor hierarchy

## 🔍 Automated Test Validations

### Universal Validations:
- ✅ **Response Times**: < 1000ms for standard operations
- ✅ **JSON Structure**: Valid JSON responses
- ✅ **Required Fields**: All mandatory properties present
- ✅ **Data Types**: Correct type validation
- ✅ **Business Rules**: Domain-specific logic verification

### Service-Specific Validations:
- **Products Advanced**: FIFO/FEFO logic, inventory consistency, traceability, extended data validation
- **Products Basic**: Standard CRUD operations, basic data validation
- **Groups**: Hierarchy integrity, permission inheritance, user assignments

## 🔧 Troubleshooting

### Common Issues:
- **Connection Refused**: Verify services are running on correct ports
- **401 Unauthorized**: Check JWT token validity for Access Service
- **404 Errors**: Confirm baseUrl configuration
- **Test Failures**: Verify response structures match expectations

### Service-Specific Issues:

#### Products Service:
- **Database Connection**: Ensure PostgreSQL is running
- **FIFO/FEFO Errors**: Verify batch data with valid dates
- **Inventory Inconsistencies**: Check stock quantity calculations
- **req.body undefined**: Ensure Express JSON middleware is configured (see ERROR_FIX documentation)

#### Access Service - Groups:
- **Hierarchy Errors**: Verify parent-child relationships don't create cycles
- **Permission Errors**: Confirm permissions exist before assignment
- **DefaultGroup Issues**: DefaultGroup cannot be deleted or have parent

## 📁 Collection Files Structure

```
postman-collection/
├── products-service-advanced-testing.postman_collection.json  ⭐ RECOMMENDED
├── products-service-testing.postman_collection.json           (Legacy)
├── access-service-groups-api.postman_collection.json
├── PRODUCTS_SERVICE_UPDATE_COMPLETED.md                       📋 Update Documentation
├── PRODUCTS_SERVICE_ERROR_FIX.md                             🔧 Bug Fix Documentation
└── README.md (this file)
```

## 📝 Advanced Usage

### Running Collections with Newman (CLI):
```bash
# Install Newman
npm install -g newman

# Run Products Service Advanced collection
newman run products-service-advanced-testing.postman_collection.json

# Run Products Service Basic collection
newman run products-service-testing.postman_collection.json

# Run Access Service Groups collection
newman run access-service-groups-api.postman_collection.json \\
  --env-var \"authToken=your-jwt-token\"
```

### Integration with CI/CD:
```yaml
# Example GitHub Actions workflow
- name: Run API Tests
  run: |
    newman run postman-collection/products-service-advanced-testing.postman_collection.json --reporters cli,json
    newman run postman-collection/access-service-groups-api.postman_collection.json --env-var \"authToken=${{ secrets.JWT_TOKEN }}\"
```

## 🆕 Products Service v1.3.0 - What's New

### Enhanced Features:
- **Complete CRUD Operations**: Full product lifecycle management
- **Advanced Stock Operations**: FIFO/FEFO algorithms with intelligent batch selection
- **Extended Data Models**: New fields for enterprise requirements
- **Batch Traceability**: Complete tracking with utilization analytics
- **Error Handling**: Robust req.body validation and error management
- **Performance Monitoring**: Response time validation and optimization

### Bug Fixes Applied:
- ✅ **Fixed req.body undefined error** with proper Express middleware configuration
- ✅ **Enhanced error handling** in stock reservation operations
- ✅ **Added comprehensive validations** for all request parameters
- ✅ **Improved logging** for debugging and monitoring

### Testing Enhancements:
- **85+ Automated Tests**: Comprehensive validation coverage
- **Advanced Scenarios**: End-to-end workflow testing
- **Performance Tests**: Response time monitoring
- **Error Validation**: Comprehensive error response testing

## 🔄 Version History

| Version | Date | Service | Changes |
|---------|------|---------|---------|
| 1.0.0 | 2025-01-03 | Products | Initial basic collection |
| 1.3.0 | 2025-06-24 | Products | Advanced features, FIFO/FEFO, traceability, bug fixes |
| 2.0.0 | 2025-01-03 | Access | Added Groups API collection |

## 📞 Support

For issues with collections:
- **Technical Support**: [support@ximplicity.com](mailto:support@ximplicity.com)
- **GitHub Issues**: [Report API issues](https://github.com/Ximplicity/enterprise-commerce-platform/issues)
- **Documentation**: See individual service documentation in `/docs` folder

---

## Español

Este directorio contiene colecciones completas de Postman para probar todas las APIs de la Plataforma de Comercio Empresarial XAP, incluyendo características avanzadas como algoritmos FIFO/FEFO, trazabilidad de lotes y gestión de inventario de nivel empresarial.

## 📊 Colecciones Disponibles

### 🛍️ **Servicio de Productos - Testing Avanzado** ⭐ ACTUALIZADO v1.3.0
#### `products-service-advanced-testing.postman_collection.json`
Colección completa de testing avanzado para el Servicio de Productos con características de gestión de inventario de vanguardia:

**🆕 Nuevo en v1.3.0:**
- ✅ **CRUD Completo de Productos**: Operaciones mejoradas CREATE, UPDATE, DELETE
- ✅ **Operaciones de Stock Avanzadas**: Implementación de lógica FIFO/FEFO con selección inteligente de lotes
- ✅ **Trazabilidad Completa de Lotes**: Seguimiento extremo a extremo con análisis de utilización
- ✅ **Modelos de Datos Mejorados**: Campos extendidos (productCode, familyName, isActive, specifications, media, packages, stockSummary)
- ✅ **Correcciones Automáticas de Errores**: Resueltos problemas de req.body undefined con manejo integral de errores
- ✅ **31+ Endpoints**: Cobertura completa de API con 85+ validaciones automatizadas

**Principales Categorías de Endpoints:**
- 🔍 **Health & Status**: Monitoreo de servicio con validación de versión (v1.1.1)
- 📦 **Gestión de Productos**: CRUD mejorado con estructuras de datos extendidas
- 📊 **Gestión de Stock**: Operaciones completas de inventario con soporte de lotes
- 🔄 **Operaciones Avanzadas**: Algoritmos FIFO/FEFO con lógica de selección inteligente
- 🔍 **Trazabilidad de Lotes**: Seguimiento completo con análisis y monitoreo de vencimiento
- 📈 **Movimientos y Pista de Auditoría**: Seguimiento y análisis integral de movimientos
- ⚠️ **Alertas y Análisis**: Alertas de stock bajo y dashboard de análisis de inventario
- 🧪 **Escenarios de Testing Avanzado**: Flujos de trabajo de testing extremo a extremo

### 🛍️ **Servicio de Productos - Testing Básico** (Legado)
#### `products-service-testing.postman_collection.json`
Colección básica de testing API mantenida para compatibilidad:

**Características:**
- ✅ **CRUD Básico**: Operaciones estándar de productos
- ✅ **Operaciones Simples de Stock**: Gestión básica de inventario
- ✅ **Monitoreo de Salud**: Verificaciones de estado del servicio

*Nota: Considera actualizar a la colección de Testing Avanzado para acceso completo a características.*

### 🔐 **Servicio de Acceso - API de Grupos**
#### `access-service-groups-api.postman_collection.json`
Colección completa de testing API para gestión de Grupos en el Servicio de Acceso con organización jerárquica:

**Características Clave:**
- ✅ **CRUD Completo de Grupos**: Operaciones crear, leer, actualizar, eliminar
- ✅ **Gestión Jerárquica**: Relaciones padre-hijo con profundidad ilimitada
- ✅ **Gestión de Usuarios**: Asignaciones individuales y masivas de usuarios
- ✅ **Gestión de Permisos**: Asignaciones individuales y masivas de permisos
- ✅ **Consultas Jerárquicas Avanzadas**: Ancestros, descendientes, rutas, niveles
- ✅ **Búsqueda y Análisis**: Búsqueda de grupos, estadísticas y monitoreo
- ✅ **Gestión de DefaultGroup**: Operaciones especiales de grupo predeterminado
- ✅ **30+ Endpoints**: Cobertura completa de API CQRS

## 🎯 Escenarios de Testing Recomendados

### Flujo Avanzado del Servicio de Productos:
1. **Gestión Básica de Productos**: Crear → Leer → Actualizar → Eliminar con datos extendidos
2. **Flujo de Stock Avanzado**: Crear stock → Añadir lotes → Reservar (FEFO) → Consumir → Verificar trazabilidad
3. **Testing FIFO vs FEFO**: Comparar comportamiento algorítmico con diferentes fechas de lotes
4. **Monitoreo y Alertas**: Monitoreo de stock bajo y vencimiento con análisis
5. **Test de Flujo Completo**: Testing automatizado de escenarios extremo a extremo

## 🔧 Correcciones y Mejoras

### Errores Corregidos en v1.3.0:
- ✅ **Error req.body undefined corregido** con configuración adecuada de middleware Express
- ✅ **Manejo de errores mejorado** en operaciones de reserva de stock
- ✅ **Validaciones integrales añadidas** para todos los parámetros de request
- ✅ **Logging mejorado** para debugging y monitoreo

### Documentación Técnica:
- 📋 **PRODUCTS_SERVICE_UPDATE_COMPLETED.md**: Documentación completa de la actualización
- 🔧 **PRODUCTS_SERVICE_ERROR_FIX.md**: Documentación detallada de corrección de errores

---

**Construido con ❤️ para testing empresarial integral**

*Última Actualización: Julio 3, 2025 - Consolidación de documentación y colecciones avanzadas*