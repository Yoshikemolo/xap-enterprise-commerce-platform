# Comandos para configurar repositorio Git y GitHub
# Ejecutar desde: C:\WORK\REPO\Ximplicity\enterprise-commerce-platform

## 1. Inicializar repositorio Git
git init

## 2. Configurar branch principal
git branch -M main

## 3. Agregar archivos
git add .

## 4. Primer commit
git commit -m "feat: initial commit - enterprise commerce platform

- Configuración inicial del monorepo con Nx
- Estructura de microservicios implementada
- Apps: manager-app, customer-app, api-gateway
- Services: access, products, commerce, scheduling, business
- Stack: Angular 20, NestJS, GraphQL, MySQL, Redis
- Documentación técnica y funcional incluida"

## 5. Crear repositorio privado en GitHub (requiere GitHub CLI)
gh repo create enterprise-commerce-platform --private --description "A comprehensive enterprise-level commerce management system built with modern technologies and scalable architecture" --clone=false

## 6. Configurar remote y hacer push
git remote add origin https://github.com/[TU-USERNAME]/enterprise-commerce-platform.git
git push -u origin main

# Nota: Reemplaza [TU-USERNAME] con tu usuario real de GitHub
