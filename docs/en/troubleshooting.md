# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Enterprise Commerce Platform.

## 📋 Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Installation Issues](#installation-issues)
- [Development Issues](#development-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Performance Issues](#performance-issues)
- [Build and Deployment Issues](#build-and-deployment-issues)
- [Service-Specific Issues](#service-specific-issues)
- [Getting Help](#getting-help)

## Quick Diagnostics

### System Health Check

Run this comprehensive health check to identify common issues:

```bash
# Check Node.js and npm versions
node --version && npm --version

# Check Docker status
docker --version && docker-compose --version

# Check if Docker services are running
docker-compose ps

# Check for port conflicts
netstat -an | grep -E ":(3000|3001|3306|6379|8080)"

# Check disk space
df -h

# Check memory usage
free -h  # Linux/Mac
# Or use Task Manager on Windows
```

### Environment Verification

```bash
# Verify all required environment variables
npm run env:check

# Check if all dependencies are installed
npm ls --depth=0

# Verify TypeScript compilation
npx tsc --noEmit

# Run linting
npm run lint
```

## Installation Issues

### Issue: `npm install` fails

**Symptoms:**
- Installation hangs or times out
- Permission errors
- Network connectivity issues

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check npm registry:**
   ```bash
   npm config get registry
   # Should return: https://registry.npmjs.org/
   ```

3. **Fix permission issues (Linux/Mac):**
   ```bash
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) node_modules
   ```

4. **Use different registry:**
   ```bash
   npm install --registry https://registry.npmmirror.com/
   ```

### Issue: Docker services won't start

**Symptoms:**
- `docker-compose up` fails
- Services exit immediately
- Port binding errors

**Solutions:**

1. **Check Docker daemon:**
   ```bash
   docker info
   # If fails, start Docker daemon
   ```

2. **Check port conflicts:**
   ```bash
   # Check if ports are already in use
   netstat -an | grep -E ":(3306|6379|8080|9000)"
   # Kill processes using required ports
   ```

3. **Reset Docker:**
   ```bash
   docker-compose down -v
   docker system prune -f
   docker-compose up -d
   ```

4. **Check disk space:**
   ```bash
   docker system df
   # Clean up if needed
   docker system prune -af
   ```

## Development Issues

### Issue: Application won't start

**Symptoms:**
- `npm run dev` fails
- Services crash on startup
- Module not found errors

**Solutions:**

1. **Verify dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Check environment variables:**
   ```bash
   # Copy environment file
   cp .env.example .env
   # Edit with your configuration
   ```

3. **Clear Nx cache:**
   ```bash
   nx reset
   npm run dev
   ```

### Issue: Hot reload not working

**Symptoms:**
- Changes don't reflect automatically
- Browser doesn't refresh

**Solutions:**

1. **Check file watchers:**
   ```bash
   # Linux: Increase inotify limit
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Disable antivirus real-time scanning** for project directory

3. **Use polling mode:**
   ```bash
   ng serve --poll=2000
   ```

### Issue: TypeScript compilation errors

**Symptoms:**
- Type errors in IDE
- Build fails with TS errors

**Solutions:**

1. **Update TypeScript:**
   ```bash
   npm update typescript
   ```

2. **Clear TypeScript cache:**
   ```bash
   # VS Code
   Ctrl+Shift+P > "TypeScript: Restart TS Server"
   ```

3. **Check tsconfig.json:**
   ```bash
   # Verify path mappings and compiler options
   npx tsc --showConfig
   ```

## Database Issues

### Issue: Cannot connect to MySQL

**Symptoms:**
- Connection timeout
- Access denied errors
- Database not found

**Solutions:**

1. **Check MySQL service:**
   ```bash
   docker-compose ps mysql
   docker-compose logs mysql
   ```

2. **Verify connection settings:**
   ```bash
   # Test connection manually
   docker-compose exec mysql mysql -u root -p
   ```

3. **Reset MySQL:**
   ```bash
   docker-compose down mysql
   docker volume rm enterprise-commerce-platform_mysql_data
   docker-compose up -d mysql
   ```

4. **Check MySQL configuration:**
   ```sql
   -- Inside MySQL
   SHOW VARIABLES LIKE 'max_connections';
   SHOW PROCESSLIST;
   ```

### Issue: Migration failures

**Symptoms:**
- Database schema errors
- Migration rollback issues

**Solutions:**

1. **Check migration status:**
   ```bash
   npm run migration:show
   ```

2. **Rollback and retry:**
   ```bash
   npm run migration:revert
   npm run migration:run
   ```

3. **Manual database reset:**
   ```sql
   DROP DATABASE IF EXISTS enterprise_platform;
   CREATE DATABASE enterprise_platform;
   ```

## Authentication Issues

### Issue: Keycloak connection problems

**Symptoms:**
- Login page not loading
- Authentication redirects fail
- Token validation errors

**Solutions:**

1. **Check Keycloak service:**
   ```bash
   docker-compose ps keycloak
   docker-compose logs keycloak
   ```

2. **Verify Keycloak configuration:**
   - Access: http://localhost:8080
   - Check realm settings
   - Verify client configuration

3. **Reset Keycloak:**
   ```bash
   docker-compose down keycloak
   docker volume rm enterprise-commerce-platform_keycloak_data
   docker-compose up -d keycloak
   ```

### Issue: JWT token issues

**Symptoms:**
- Token expired errors
- Invalid signature errors
- Authorization failures

**Solutions:**

1. **Check JWT configuration:**
   ```bash
   # Verify JWT_SECRET is set
   echo $JWT_SECRET
   ```

2. **Clear browser storage:**
   - Clear localStorage
   - Clear sessionStorage
   - Clear cookies

3. **Verify token manually:**
   ```bash
   # Use jwt.io to decode and verify token
   ```

## Performance Issues

### Issue: Slow application startup

**Symptoms:**
- Long wait times during startup
- High CPU/memory usage

**Solutions:**

1. **Profile startup:**
   ```bash
   # Use Node.js profiler
   node --prof app.js
   ```

2. **Optimize dependencies:**
   ```bash
   npm run analyze
   # Check bundle size
   ```

3. **Increase memory limits:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run dev
   ```

### Issue: Database query performance

**Symptoms:**
- Slow API responses
- Database timeouts

**Solutions:**

1. **Enable query logging:**
   ```sql
   SET GLOBAL general_log = 'ON';
   SET GLOBAL log_output = 'TABLE';
   ```

2. **Analyze slow queries:**
   ```sql
   SELECT * FROM mysql.slow_log;
   EXPLAIN SELECT * FROM your_table;
   ```

3. **Add missing indexes:**
   ```sql
   SHOW INDEX FROM your_table;
   CREATE INDEX idx_column ON your_table(column);
   ```

## Build and Deployment Issues

### Issue: Build failures

**Symptoms:**
- TypeScript compilation errors
- Missing dependencies
- Memory issues during build

**Solutions:**

1. **Clean build:**
   ```bash
   nx reset
   rm -rf dist
   npm run build
   ```

2. **Increase build memory:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=8192"
   npm run build
   ```

3. **Build specific apps:**
   ```bash
   nx build manager-app
   nx build customer-app
   ```

### Issue: Docker build failures

**Symptoms:**
- Image build errors
- Dependency installation failures
- Network timeouts

**Solutions:**

1. **Clear Docker cache:**
   ```bash
   docker system prune -af
   docker-compose build --no-cache
   ```

2. **Use multi-stage builds:**
   ```dockerfile
   # Optimize Dockerfile for better caching
   ```

3. **Check Docker resources:**
   - Increase memory allocation
   - Increase disk space

## Service-Specific Issues

### Access Service

**Common Issues:**
- User creation fails
- Role assignment errors
- Permission validation issues

**Debug Steps:**
```bash
# Check service logs
nx serve access-service --verbose

# Test specific endpoints
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Products Service

**Common Issues:**
- Inventory calculation errors
- Batch tracking failures
- Stock reservation problems

**Debug Steps:**
```bash
# Check batch calculations
# Verify FIFO/FEFO logic
# Test stock operations
```

### API Gateway

**Common Issues:**
- GraphQL schema conflicts
- Service discovery failures
- Gateway timeouts

**Debug Steps:**
```bash
# Check GraphQL playground
# Verify service health
# Monitor gateway logs
```

## Monitoring and Logging

### Enable Debug Logging

```bash
# Set debug environment
export DEBUG=app:*
export LOG_LEVEL=debug

# Start with verbose logging
npm run dev -- --verbose
```

### Check OpenTelemetry

```bash
# Verify tracing
curl http://localhost:3000/health
# Check traces in monitoring dashboard
```

### Monitor Resource Usage

```bash
# CPU and memory
htop

# Disk usage
df -h

# Network connections
netstat -an | grep LISTEN
```

## Getting Help

### Before Asking for Help

1. **Search existing issues**: Check GitHub issues for similar problems
2. **Check documentation**: Review relevant docs and FAQ
3. **Gather information**: Collect error logs, environment details
4. **Minimal reproduction**: Create minimal example that reproduces the issue

### Information to Include

When reporting issues, include:

```
- OS and version
- Node.js and npm versions
- Docker version
- Browser version (for frontend issues)
- Full error messages and stack traces
- Steps to reproduce
- Expected vs actual behavior
- Environment variables (without sensitive data)
```

### Contact Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community help
- **Email**: [support@ximplicity.com](mailto:support@ximplicity.com)

### Emergency Issues

For critical production issues:
- **Email**: [emergency@ximplicity.com](mailto:emergency@ximplicity.com)
- **Response Time**: 2 hours during business hours

---

## Quick Reference Commands

```bash
# Health check
npm run health:check

# Reset everything
nx reset && rm -rf node_modules && npm install

# Docker reset
docker-compose down -v && docker system prune -f

# Database reset
npm run db:reset

# Clear all caches
npm run cache:clear

# Full system restart
npm run restart:all
```

---

*This troubleshooting guide is continuously updated. Last updated: June 20, 2025*
