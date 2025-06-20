# Guía de Resolución de Problemas

Esta guía te ayuda a diagnosticar y resolver problemas comunes con la Enterprise Commerce Platform.

## 📋 Tabla de Contenidos

- [Diagnósticos Rápidos](#diagnósticos-rápidos)
- [Problemas de Instalación](#problemas-de-instalación)
- [Problemas de Desarrollo](#problemas-de-desarrollo)
- [Problemas de Base de Datos](#problemas-de-base-de-datos)
- [Problemas de Autenticación](#problemas-de-autenticación)
- [Problemas de Performance](#problemas-de-performance)
- [Problemas de Build y Despliegue](#problemas-de-build-y-despliegue)
- [Problemas Específicos de Servicios](#problemas-específicos-de-servicios)
- [Obtener Ayuda](#obtener-ayuda)

## Diagnósticos Rápidos

### Verificación de Salud del Sistema

Ejecuta esta verificación comprensiva para identificar problemas comunes:

```bash
# Verificar versiones de Node.js y npm
node --version && npm --version

# Verificar estado de Docker
docker --version && docker-compose --version

# Verificar si los servicios Docker están ejecutándose
docker-compose ps

# Verificar conflictos de puertos
netstat -an | grep -E ":(3000|3001|3306|6379|8080)"

# Verificar espacio en disco
df -h

# Verificar uso de memoria
free -h  # Linux/Mac
# O usar Administrador de Tareas en Windows
```

### Verificación de Entorno

```bash
# Verificar todas las variables de entorno requeridas
npm run env:check

# Verificar si todas las dependencias están instaladas
npm ls --depth=0

# Verificar compilación de TypeScript
npx tsc --noEmit

# Ejecutar linting
npm run lint
```

## Problemas de Instalación

### Problema: `npm install` falla

**Síntomas:**
- La instalación se cuelga o se agota el tiempo
- Errores de permisos
- Problemas de conectividad de red

**Soluciones:**

1. **Limpiar caché de npm:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Verificar registro de npm:**
   ```bash
   npm config get registry
   # Debería devolver: https://registry.npmjs.org/
   ```

3. **Corregir problemas de permisos (Linux/Mac):**
   ```bash
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) node_modules
   ```

4. **Usar registro diferente:**
   ```bash
   npm install --registry https://registry.npmmirror.com/
   ```

### Problema: Los servicios Docker no inician

**Síntomas:**
- `docker-compose up` falla
- Los servicios se cierran inmediatamente
- Errores de binding de puertos

**Soluciones:**

1. **Verificar daemon de Docker:**
   ```bash
   docker info
   # Si falla, iniciar daemon de Docker
   ```

2. **Verificar conflictos de puertos:**
   ```bash
   # Verificar si los puertos ya están en uso
   netstat -an | grep -E ":(3306|6379|8080|9000)"
   # Terminar procesos que usan puertos requeridos
   ```

3. **Reiniciar Docker:**
   ```bash
   docker-compose down -v
   docker system prune -f
   docker-compose up -d
   ```

4. **Verificar espacio en disco:**
   ```bash
   docker system df
   # Limpiar si es necesario
   docker system prune -af
   ```

## Problemas de Desarrollo

### Problema: La aplicación no inicia

**Síntomas:**
- `npm run dev` falla
- Los servicios se cuelgan al inicio
- Errores de módulo no encontrado

**Soluciones:**

1. **Verificar dependencias:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Verificar variables de entorno:**
   ```bash
   # Copiar archivo de entorno
   cp .env.example .env
   # Editar con tu configuración
   ```

3. **Limpiar caché de Nx:**
   ```bash
   nx reset
   npm run dev
   ```

### Problema: Hot reload no funciona

**Síntomas:**
- Los cambios no se reflejan automáticamente
- El navegador no se actualiza

**Soluciones:**

1. **Verificar file watchers:**
   ```bash
   # Linux: Aumentar límite de inotify
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Deshabilitar escaneo en tiempo real del antivirus** para el directorio del proyecto

3. **Usar modo polling:**
   ```bash
   ng serve --poll=2000
   ```

### Problema: Errores de compilación de TypeScript

**Síntomas:**
- Errores de tipo en IDE
- Build falla con errores TS

**Soluciones:**

1. **Actualizar TypeScript:**
   ```bash
   npm update typescript
   ```

2. **Limpiar caché de TypeScript:**
   ```bash
   # VS Code
   Ctrl+Shift+P > "TypeScript: Restart TS Server"
   ```

3. **Verificar tsconfig.json:**
   ```bash
   # Verificar mapeos de rutas y opciones del compilador
   npx tsc --showConfig
   ```

## Problemas de Base de Datos

### Problema: No se puede conectar a MySQL

**Síntomas:**
- Timeout de conexión
- Errores de acceso denegado
- Base de datos no encontrada

**Soluciones:**

1. **Verificar servicio MySQL:**
   ```bash
   docker-compose ps mysql
   docker-compose logs mysql
   ```

2. **Verificar configuración de conexión:**
   ```bash
   # Probar conexión manualmente
   docker-compose exec mysql mysql -u root -p
   ```

3. **Reiniciar MySQL:**
   ```bash
   docker-compose down mysql
   docker volume rm enterprise-commerce-platform_mysql_data
   docker-compose up -d mysql
   ```

4. **Verificar configuración de MySQL:**
   ```sql
   -- Dentro de MySQL
   SHOW VARIABLES LIKE 'max_connections';
   SHOW PROCESSLIST;
   ```

### Problema: Fallos de migración

**Síntomas:**
- Errores de esquema de base de datos
- Problemas de rollback de migración

**Soluciones:**

1. **Verificar estado de migración:**
   ```bash
   npm run migration:show
   ```

2. **Rollback y reintentar:**
   ```bash
   npm run migration:revert
   npm run migration:run
   ```

3. **Reinicio manual de base de datos:**
   ```sql
   DROP DATABASE IF EXISTS enterprise_platform;
   CREATE DATABASE enterprise_platform;
   ```

## Problemas de Autenticación

### Problema: Problemas de conexión con Keycloak

**Síntomas:**
- La página de login no carga
- Los redirects de autenticación fallan
- Errores de validación de token

**Soluciones:**

1. **Verificar servicio Keycloak:**
   ```bash
   docker-compose ps keycloak
   docker-compose logs keycloak
   ```

2. **Verificar configuración de Keycloak:**
   - Acceder: http://localhost:8080
   - Verificar configuración de realm
   - Verificar configuración de cliente

3. **Reiniciar Keycloak:**
   ```bash
   docker-compose down keycloak
   docker volume rm enterprise-commerce-platform_keycloak_data
   docker-compose up -d keycloak
   ```

### Problema: Problemas de token JWT

**Síntomas:**
- Errores de token expirado
- Errores de firma inválida
- Fallos de autorización

**Soluciones:**

1. **Verificar configuración JWT:**
   ```bash
   # Verificar que JWT_SECRET esté configurado
   echo $JWT_SECRET
   ```

2. **Limpiar almacenamiento del navegador:**
   - Limpiar localStorage
   - Limpiar sessionStorage
   - Limpiar cookies

3. **Verificar token manualmente:**
   ```bash
   # Usar jwt.io para decodificar y verificar token
   ```

## Problemas de Performance

### Problema: Inicio lento de aplicación

**Síntomas:**
- Largos tiempos de espera durante el inicio
- Alto uso de CPU/memoria

**Soluciones:**

1. **Perfilar el inicio:**
   ```bash
   # Usar profiler de Node.js
   node --prof app.js
   ```

2. **Optimizar dependencias:**
   ```bash
   npm run analyze
   # Verificar tamaño del bundle
   ```

3. **Aumentar límites de memoria:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run dev
   ```

### Problema: Performance de consultas de base de datos

**Síntomas:**
- Respuestas lentas de API
- Timeouts de base de datos

**Soluciones:**

1. **Habilitar logging de consultas:**
   ```sql
   SET GLOBAL general_log = 'ON';
   SET GLOBAL log_output = 'TABLE';
   ```

2. **Analizar consultas lentas:**
   ```sql
   SELECT * FROM mysql.slow_log;
   EXPLAIN SELECT * FROM your_table;
   ```

3. **Agregar índices faltantes:**
   ```sql
   SHOW INDEX FROM your_table;
   CREATE INDEX idx_column ON your_table(column);
   ```

## Problemas de Build y Despliegue

### Problema: Fallos de build

**Síntomas:**
- Errores de compilación de TypeScript
- Dependencias faltantes
- Problemas de memoria durante build

**Soluciones:**

1. **Build limpio:**
   ```bash
   nx reset
   rm -rf dist
   npm run build
   ```

2. **Aumentar memoria de build:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=8192"
   npm run build
   ```

3. **Build de apps específicas:**
   ```bash
   nx build manager-app
   nx build customer-app
   ```

### Problema: Fallos de build de Docker

**Síntomas:**
- Errores de build de imagen
- Fallos de instalación de dependencias
- Timeouts de red

**Soluciones:**

1. **Limpiar caché de Docker:**
   ```bash
   docker system prune -af
   docker-compose build --no-cache
   ```

2. **Usar builds multi-stage:**
   ```dockerfile
   # Optimizar Dockerfile para mejor caching
   ```

3. **Verificar recursos de Docker:**
   - Aumentar asignación de memoria
   - Aumentar espacio en disco

## Problemas Específicos de Servicios

### Access Service

**Problemas Comunes:**
- Falla la creación de usuarios
- Errores de asignación de roles
- Problemas de validación de permisos

**Pasos de Debug:**
```bash
# Verificar logs del servicio
nx serve access-service --verbose

# Probar endpoints específicos
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Products Service

**Problemas Comunes:**
- Errores de cálculo de inventario
- Fallos de tracking de lotes
- Problemas de reserva de stock

**Pasos de Debug:**
```bash
# Verificar cálculos de lotes
# Verificar lógica FIFO/FEFO
# Probar operaciones de stock
```

### API Gateway

**Problemas Comunes:**
- Conflictos de esquema GraphQL
- Fallos de service discovery
- Timeouts de gateway

**Pasos de Debug:**
```bash
# Verificar playground de GraphQL
# Verificar salud de servicios
# Monitorear logs de gateway
```

## Monitoreo y Logging

### Habilitar Debug Logging

```bash
# Configurar entorno de debug
export DEBUG=app:*
export LOG_LEVEL=debug

# Iniciar con logging verbose
npm run dev -- --verbose
```

### Verificar OpenTelemetry

```bash
# Verificar tracing
curl http://localhost:3000/health
# Verificar trazas en dashboard de monitoreo
```

### Monitorear Uso de Recursos

```bash
# CPU y memoria
htop

# Uso de disco
df -h

# Conexiones de red
netstat -an | grep LISTEN
```

## Obtener Ayuda

### Antes de Pedir Ayuda

1. **Buscar issues existentes**: Verificar issues de GitHub para problemas similares
2. **Revisar documentación**: Consultar docs relevantes y FAQ
3. **Recopilar información**: Recolectar logs de error, detalles del entorno
4. **Reproducción mínima**: Crear ejemplo mínimo que reproduzca el problema

### Información a Incluir

Al reportar problemas, incluye:

```
- OS y versión
- Versiones de Node.js y npm
- Versión de Docker
- Versión de navegador (para problemas de frontend)
- Mensajes de error completos y stack traces
- Pasos para reproducir
- Comportamiento esperado vs actual
- Variables de entorno (sin datos sensibles)
```

### Canales de Contacto

- **GitHub Issues**: Para bugs y solicitudes de características
- **GitHub Discussions**: Para preguntas y ayuda de la comunidad
- **Email**: [support@ximplicity.com](mailto:support@ximplicity.com)

### Problemas de Emergencia

Para problemas críticos de producción:
- **Email**: [emergency@ximplicity.com](mailto:emergency@ximplicity.com)
- **Tiempo de Respuesta**: 2 horas durante horario laboral

---

## Comandos de Referencia Rápida

```bash
# Verificación de salud
npm run health:check

# Reiniciar todo
nx reset && rm -rf node_modules && npm install

# Reinicio de Docker
docker-compose down -v && docker system prune -f

# Reinicio de base de datos
npm run db:reset

# Limpiar todos los cachés
npm run cache:clear

# Reinicio completo del sistema
npm run restart:all
```

---

*Esta guía de resolución de problemas se actualiza continuamente. Última actualización: 20 de Junio, 2025*
