# FAQ - Preguntas Frecuentes

## 📋 Tabla de Contenidos

- [Preguntas Generales](#preguntas-generales)
- [Primeros Pasos](#primeros-pasos)
- [Desarrollo](#desarrollo)
- [Arquitectura](#arquitectura)
- [Despliegue](#despliegue)
- [Resolución de Problemas](#resolución-de-problemas)
- [Contribuir](#contribuir)
- [Seguridad](#seguridad)

## Preguntas Generales

### ¿Qué es la Enterprise Commerce Platform?

La Enterprise Commerce Platform es un sistema comprensivo de gestión de comercio de nivel empresarial construido con tecnologías modernas y arquitectura escalable. Implementa una plataforma de comercio completa con gestión de portafolio de productos, precios dinámicos, segmentación de clientes y gestión de cadena de distribución usando arquitectura de microservicios.

### ¿Qué tecnologías se utilizan?

- **Frontend**: Angular 19, PrimeNG, SCSS, Signals, Redux Pattern
- **Backend**: NestJS, GraphQL, TypeORM, Patrón CQRS
- **Base de Datos**: MySQL
- **Message Broker**: Redis + BullMQ
- **Autenticación**: Keycloak + RBAC
- **Arquitectura**: Hexagonal + DDD + Event Sourcing
- **Monitoreo**: OpenTelemetry
- **Monorepo**: Nx Workspace 20.5

### ¿Es este proyecto de código abierto?

Sí, el proyecto está licenciado bajo la Licencia MIT. Consulta el archivo [LICENSE](../LICENSE) para más detalles.

### ¿Quién mantiene este proyecto?

El proyecto es mantenido por Ximplicity Software Solutions, S.L., con Jorge Rodríguez Rengel (AKA Yoshikemolo) como arquitecto principal y desarrollador.

## Primeros Pasos

### ¿Cuáles son los requisitos del sistema?

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** última versión
- **Docker** y **Docker Compose** para infraestructura
- **8GB RAM mínimo** (16GB recomendado)
- **20GB espacio libre en disco**

### ¿Cómo instalo el proyecto localmente?

1. Clonar el repositorio
2. Ejecutar `npm install`
3. Iniciar infraestructura con `docker-compose up -d mysql redis minio keycloak`
4. Ejecutar `npm run dev`

Consulta la [Guía de Desarrollo](./development.md) para instrucciones detalladas.

### ¿Por qué la instalación toma tanto tiempo?

El proyecto usa una estructura monorepo con muchas dependencias. La instalación inicial puede tomar 5-10 minutos dependiendo de tu conexión a internet y especificaciones del sistema.

### ¿Puedo ejecutar solo servicios específicos?

Sí, puedes ejecutar servicios individuales usando comandos Nx:
```bash
nx serve access-service
nx serve products-service
nx serve manager-app
```

## Desarrollo

### ¿Qué IDE se recomienda?

Recomendamos **Visual Studio Code** con las siguientes extensiones:
- Angular Language Service
- TypeScript Hero
- ESLint
- Prettier
- Docker
- GitLens

### ¿Cómo ejecuto las pruebas?

```bash
# Todas las pruebas
npm run test

# Servicio específico
nx test access-service

# Con cobertura
npm run test:coverage

# Pruebas E2E
npm run test:e2e
```

### ¿Cómo agrego un nuevo microservicio?

1. Generar el servicio: `nx generate @nx/nest:application mi-servicio`
2. Implementar patrón CQRS siguiendo servicios existentes
3. Agregar entidades de base de datos y repositorios
4. Crear resolvers GraphQL
5. Agregar pruebas y documentación

### ¿Por qué obtengo errores de TypeScript?

Causas comunes:
- Dependencias desactualizadas: Ejecutar `npm install`
- Tipos faltantes: Instalar `@types/package-name`
- Problemas de modo estricto: Seguir nuestras pautas de TypeScript
- Mapeo de rutas: Revisar `tsconfig.base.json`

### ¿Cómo depuro la aplicación?

1. **Backend**: Usar debugger de VS Code con configuraciones de lanzamiento
2. **Frontend**: Usar herramientas de desarrollo del navegador y Angular DevTools
3. **Base de Datos**: Usar MySQL Workbench o herramientas similares
4. **Logs**: Revisar salida de consola y trazas de OpenTelemetry

## Arquitectura

### ¿Por qué el patrón CQRS?

CQRS (Command Query Responsibility Segregation) proporciona:
- **Escalabilidad**: Modelos separados de lectura/escritura
- **Performance**: Consultas optimizadas
- **Flexibilidad**: Diferentes estrategias de almacenamiento
- **Mantenibilidad**: Separación clara de responsabilidades

### ¿Cuál es la diferencia entre Commands y Queries?

- **Commands**: Cambian el estado del sistema (Crear, Actualizar, Eliminar)
- **Queries**: Leen el estado del sistema sin cambios (Obtener, Listar, Buscar)

### ¿Cómo funciona Event Sourcing?

Cada cambio de dominio emite eventos que son:
1. Almacenados en event store
2. Publicados al message bus
3. Manejados por event handlers
4. Usados para actualizar modelos de lectura

### ¿Por qué Arquitectura Hexagonal?

La Arquitectura Hexagonal proporciona:
- **Testabilidad**: Fácil simular dependencias externas
- **Flexibilidad**: Intercambiar componentes de infraestructura
- **Enfoque en Dominio**: Lógica de negocio aislada de preocupaciones técnicas

## Despliegue

### ¿Cuáles son las opciones de despliegue?

1. **Docker Compose**: Desarrollo y despliegues pequeños
2. **Kubernetes**: Orquestación lista para producción
3. **Cloud**: AWS, Azure, GCP con despliegues contenerizados

### ¿Cómo despliego a producción?

1. Construir todas las aplicaciones: `npm run build`
2. Construir imágenes Docker: `docker-compose build`
3. Desplegar usando tu plataforma de orquestación
4. Configurar variables de entorno
5. Ejecutar migraciones de base de datos

### ¿Qué variables de entorno son requeridas?

Consulta la [Guía de Desarrollo](./development.md) para una lista completa de variables de entorno requeridas.

### ¿Cómo configuro SSL/HTTPS?

Configurar certificados SSL en:
1. **HAProxy**: Para balanceo de carga
2. **Keycloak**: Para autenticación
3. **Aplicaciones**: Establecer `HTTPS=true`

## Resolución de Problemas

### La aplicación no inicia

Soluciones comunes:
1. Verificar que todas las dependencias estén instaladas: `npm install`
2. Verificar que los servicios Docker estén ejecutándose: `docker-compose ps`
3. Revisar conflictos de puertos: `netstat -an | grep :3000`
4. Limpiar node_modules y reinstalar: `rm -rf node_modules && npm install`

### Errores de conexión a base de datos

1. Verificar que MySQL esté ejecutándose: `docker-compose ps mysql`
2. Revisar configuración de conexión en variables de entorno
3. Asegurar que la base de datos existe: `docker-compose exec mysql mysql -u root -p`
4. Revisar configuración de firewall

### La autenticación no funciona

1. Verificar que Keycloak esté ejecutándose y accesible
2. Revisar configuración de realm y cliente
3. Verificar configuración de secreto JWT
4. Revisar cookies del navegador y localStorage

### Problemas de performance

1. **Frontend**: Usar Angular DevTools para identificar cuellos de botella
2. **Backend**: Revisar performance de consultas de base de datos
3. **Base de Datos**: Revisar índices y optimización de consultas
4. **Memoria**: Monitorear uso de memoria con `htop` o herramientas similares

### Fallos de build

1. Limpiar caché de build: `nx reset`
2. Actualizar dependencias: `npm update`
3. Revisar errores de TypeScript: `npx tsc --noEmit`
4. Verificar reglas ESLint: `npm run lint`

## Contribuir

### ¿Cómo reporto un bug?

Usa nuestro [template de reporte de bugs](./.github/ISSUE_TEMPLATE/bug_report_es.md) e incluye:
- Pasos para reproducir
- Comportamiento esperado vs actual
- Información del entorno
- Screenshots o logs

### ¿Cómo sugiero una nueva característica?

Usa nuestro [template de solicitud de características](./.github/ISSUE_TEMPLATE/feature_request_es.md) e incluye:
- Caso de negocio
- Solución propuesta
- Soluciones alternativas
- Consideraciones técnicas

### ¿Cuál es el flujo de desarrollo?

1. Hacer fork del repositorio
2. Crear una rama feature: `git checkout -b feature/mi-caracteristica`
3. Realizar cambios siguiendo nuestros estándares de codificación
4. Agregar pruebas y documentación
5. Enviar un pull request

### ¿Cuánto tiempo toma la revisión de código?

- **Corrección de bugs**: 1-2 días hábiles
- **Características pequeñas**: 2-3 días hábiles
- **Características grandes**: 3-5 días hábiles
- **Cambios breaking**: Requiere revisión de arquitectura

### ¿Qué estándares de codificación siguen?

Seguimos reglas estrictas de TypeScript y ESLint. Consulta nuestra [Guía de Contribución](./contributing.md) para estándares detallados.

## Seguridad

### ¿Cómo reporto una vulnerabilidad de seguridad?

**NO** crees un issue público. Envíanos un email a [security@ximplicity.com](mailto:security@ximplicity.com). Consulta nuestra [Política de Seguridad](../SECURITY-ES.md) para detalles.

### ¿Qué características de seguridad están implementadas?

- **Autenticación**: Keycloak con tokens JWT
- **Autorización**: Control de acceso basado en roles (RBAC)
- **Cifrado**: Todos los datos en tránsito usan HTTPS/TLS
- **Validación de Entrada**: Sanitización comprensiva
- **Audit Logging**: Seguimiento completo de eventos de seguridad

### ¿Cómo configuro seguridad en producción?

1. Cambiar todas las contraseñas por defecto
2. Configurar certificados SSL/TLS
3. Establecer reglas apropiadas de firewall
4. Habilitar audit logging
5. Configurar headers de seguridad

Consulta nuestra [Política de Seguridad](../SECURITY-ES.md) para una lista completa de verificación de seguridad para producción.

### ¿Hay vulnerabilidades de seguridad conocidas?

Escaneamos regularmente las dependencias y monitoreamos avisos de seguridad. Revisa nuestra [Política de Seguridad](../SECURITY-ES.md) para el estado actual.

---

## ¿Aún tienes preguntas?

- **Preguntas Técnicas**: [Crear un issue](https://github.com/Ximplicity/enterprise-commerce-platform/issues/new/choose)
- **Discusión General**: [GitHub Discussions](https://github.com/Ximplicity/enterprise-commerce-platform/discussions)
- **Problemas de Seguridad**: [security@ximplicity.com](mailto:security@ximplicity.com)
- **Consultas de Negocio**: [contact@ximplicity.com](mailto:contact@ximplicity.com)

---

*Este FAQ se actualiza regularmente. Última actualización: 20 de Junio, 2025*
