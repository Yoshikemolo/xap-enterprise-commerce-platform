# FAQ - Frequently Asked Questions

## 📋 Table of Contents

- [General Questions](#general-questions)
- [Getting Started](#getting-started)
- [Development](#development)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Security](#security)

## General Questions

### What is the Enterprise Commerce Platform?

The Enterprise Commerce Platform is a comprehensive, enterprise-level commerce management system built with modern technologies and scalable architecture. It implements a complete commerce platform with product portfolio management, dynamic pricing, customer segmentation, and distribution chain management using a microservices architecture.

### What technologies are used?

- **Frontend**: Angular 19, PrimeNG, SCSS, Signals, Redux Pattern
- **Backend**: NestJS, GraphQL, TypeORM, CQRS Pattern
- **Database**: MySQL
- **Message Broker**: Redis + BullMQ
- **Authentication**: Keycloak + RBAC
- **Architecture**: Hexagonal + DDD + Event Sourcing
- **Monitoring**: OpenTelemetry
- **Monorepo**: Nx Workspace 20.5

### Is this project open source?

Yes, the project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.

### Who maintains this project?

The project is maintained by Ximplicity Software Solutions, S.L., with Jorge Rodríguez Rengel (AKA Yoshikemolo) as the lead architect and developer.

## Getting Started

### What are the system requirements?

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** latest version
- **Docker** and **Docker Compose** for infrastructure
- **8GB RAM minimum** (16GB recommended)
- **20GB free disk space**

### How do I install the project locally?

1. Clone the repository
2. Run `npm install`
3. Start infrastructure with `docker-compose up -d mysql redis minio keycloak`
4. Run `npm run dev`

See the [Development Guide](./development.md) for detailed instructions.

### Why does the installation take so long?

The project uses a monorepo structure with many dependencies. Initial installation may take 5-10 minutes depending on your internet connection and system specifications.

### Can I run only specific services?

Yes, you can run individual services using Nx commands:
```bash
nx serve access-service
nx serve products-service
nx serve manager-app
```

## Development

### What IDE is recommended?

We recommend **Visual Studio Code** with the following extensions:
- Angular Language Service
- TypeScript Hero
- ESLint
- Prettier
- Docker
- GitLens

### How do I run tests?

```bash
# All tests
npm run test

# Specific service
nx test access-service

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### How do I add a new microservice?

1. Generate the service: `nx generate @nx/nest:application my-service`
2. Implement CQRS pattern following existing services
3. Add database entities and repositories
4. Create GraphQL resolvers
5. Add tests and documentation

### Why am I getting TypeScript errors?

Common causes:
- Outdated dependencies: Run `npm install`
- Missing types: Install `@types/package-name`
- Strict mode issues: Follow our TypeScript guidelines
- Path mapping: Check `tsconfig.base.json`

### How do I debug the application?

1. **Backend**: Use VS Code debugger with launch configurations
2. **Frontend**: Use browser dev tools and Angular DevTools
3. **Database**: Use MySQL Workbench or similar tools
4. **Logs**: Check console output and OpenTelemetry traces

## Architecture

### Why CQRS pattern?

CQRS (Command Query Responsibility Segregation) provides:
- **Scalability**: Separate read/write models
- **Performance**: Optimized queries
- **Flexibility**: Different storage strategies
- **Maintainability**: Clear separation of concerns

### What is the difference between Commands and Queries?

- **Commands**: Change system state (Create, Update, Delete)
- **Queries**: Read system state without changes (Get, List, Search)

### How does Event Sourcing work?

Every domain change emits events that are:
1. Stored in event store
2. Published to message bus
3. Handled by event handlers
4. Used to update read models

### Why Hexagonal Architecture?

Hexagonal Architecture provides:
- **Testability**: Easy to mock external dependencies
- **Flexibility**: Swap infrastructure components
- **Domain Focus**: Business logic isolated from technical concerns

## Deployment

### What are the deployment options?

1. **Docker Compose**: Development and small deployments
2. **Kubernetes**: Production-ready orchestration
3. **Cloud**: AWS, Azure, GCP with containerized deployments

### How do I deploy to production?

1. Build all applications: `npm run build`
2. Build Docker images: `docker-compose build`
3. Deploy using your orchestration platform
4. Configure environment variables
5. Run database migrations

### What environment variables are required?

See the [Development Guide](./development.md) for a complete list of required environment variables.

### How do I configure SSL/HTTPS?

Configure SSL certificates in:
1. **HAProxy**: For load balancing
2. **Keycloak**: For authentication
3. **Applications**: Set `HTTPS=true`

## Troubleshooting

### The application won't start

Common solutions:
1. Check if all dependencies are installed: `npm install`
2. Verify Docker services are running: `docker-compose ps`
3. Check for port conflicts: `netstat -an | grep :3000`
4. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Database connection errors

1. Verify MySQL is running: `docker-compose ps mysql`
2. Check connection settings in environment variables
3. Ensure database exists: `docker-compose exec mysql mysql -u root -p`
4. Check firewall settings

### Authentication not working

1. Verify Keycloak is running and accessible
2. Check realm and client configuration
3. Verify JWT secret configuration
4. Check browser cookies and localStorage

### Performance issues

1. **Frontend**: Use Angular DevTools to identify performance bottlenecks
2. **Backend**: Check database query performance
3. **Database**: Review indexes and query optimization
4. **Memory**: Monitor memory usage with `htop` or similar tools

### Build failures

1. Clear build cache: `nx reset`
2. Update dependencies: `npm update`
3. Check TypeScript errors: `npx tsc --noEmit`
4. Verify ESLint rules: `npm run lint`

## Contributing

### How do I report a bug?

Use our [bug report template](./.github/ISSUE_TEMPLATE/bug_report.md) and include:
- Steps to reproduce
- Expected vs actual behavior
- Environment information
- Screenshots or logs

### How do I suggest a new feature?

Use our [feature request template](./.github/ISSUE_TEMPLATE/feature_request.md) and include:
- Business case
- Proposed solution
- Alternative solutions
- Technical considerations

### What is the development workflow?

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes following our coding standards
4. Add tests and documentation
5. Submit a pull request

### How long does code review take?

- **Bug fixes**: 1-2 business days
- **Small features**: 2-3 business days
- **Large features**: 3-5 business days
- **Breaking changes**: Requires architecture review

### What coding standards do you follow?

We follow strict TypeScript and ESLint rules. See our [Contributing Guide](./contributing.md) for detailed standards.

## Security

### How do I report a security vulnerability?

**DO NOT** create a public issue. Email us at [security@ximplicity.com](mailto:security@ximplicity.com). See our [Security Policy](../SECURITY.md) for details.

### What security features are implemented?

- **Authentication**: Keycloak with JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: All data in transit uses HTTPS/TLS
- **Input Validation**: Comprehensive sanitization
- **Audit Logging**: Complete security event tracking

### How do I configure security in production?

1. Change all default passwords
2. Configure SSL/TLS certificates
3. Set up proper firewall rules
4. Enable audit logging
5. Configure security headers

See our [Security Policy](../SECURITY.md) for a complete production security checklist.

### Are there any known security vulnerabilities?

We regularly scan dependencies and monitor security advisories. Check our [Security Policy](../SECURITY.md) for current status.

---

## Still have questions?

- **Technical Questions**: [Create an issue](https://github.com/Ximplicity/enterprise-commerce-platform/issues/new/choose)
- **General Discussion**: [GitHub Discussions](https://github.com/Ximplicity/enterprise-commerce-platform/discussions)
- **Security Issues**: [security@ximplicity.com](mailto:security@ximplicity.com)
- **Business Inquiries**: [contact@ximplicity.com](mailto:contact@ximplicity.com)

---

*This FAQ is updated regularly. Last updated: June 20, 2025*
