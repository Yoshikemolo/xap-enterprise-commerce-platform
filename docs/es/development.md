# Guía de Desarrollo - Plataforma de Comercio Empresarial

## Prerrequisitos

Antes de comenzar el desarrollo, asegúrate de tener lo siguiente instalado:

- **Node.js** v18.0.0 o superior
- **npm** v9.0.0 o superior
- **Docker** v20.0.0 o superior
- **Docker Compose** v2.0.0 o superior
- **MySQL** v8.0 (o usar contenedor Docker)
- **Redis** v7.0 (o usar contenedor Docker)

## Inicio Rápido

### 1. Clonar y Configurar

```bash
git clone <repository-url>
cd enterprise-commerce-platform
npm install
```

### 2. Iniciar Servicios de Infraestructura

```bash
# Iniciar solo servicios de infraestructura
docker-compose up -d mysql redis redis-bullmq minio keycloak prometheus grafana jaeger

# Esperar a que los servicios estén listos (verificar estado de salud)
docker-compose ps
```

### 3. Configuración de Base de Datos

```bash
# Ejecutar migraciones de base de datos
npm run db:migrate

# Sembrar datos iniciales
npm run db:seed
```

### 4. Iniciar Entorno de Desarrollo

```bash
# Iniciar todos los servicios en modo desarrollo
npm run dev

# O iniciar servicios individualmente:
npm run start:gateway    # API Gateway (puerto 3000)
npm run start:manager    # Manager App (puerto 4200)
npm run start:customer   # Customer App (puerto 4201)
npm run start:services   # Todos los microservicios
```

## Estructura del Proyecto

```
enterprise-commerce-platform/
├── apps/                           # Aplicaciones
│   ├── manager-app/               # SPA Angular Administrativa
│   ├── customer-app/              # SPA Angular para Clientes
│   └── api-gateway/               # Gateway de Federación GraphQL
├── libs/                          # Bibliotecas y Servicios
│   ├── shared/                    # Utilidades compartidas y tipos
│   ├── access-service/            # 🔐 Autenticación y Autorización (✅ COMPLETO)
│   ├── products-service/          # 🛍️ Gestión de Productos (🔄 60% COMPLETO)
│   ├── commerce-service/          # Lógica de Comercio
│   ├── scheduling-service/        # Eventos y Notificaciones
│   └── business-service/          # Analytics y Reportes
├── tools/                         # Herramientas de construcción y despliegue
├── docs/                          # Documentación (🌐 Bilingüe: EN/ES)
│   ├── en/                        # Documentación en inglés
│   └── es/                        # Documentación en español
└── infrastructure/               # Configuraciones de infraestructura
```

## Flujo de Trabajo de Desarrollo

### 1. Desarrollo de Características

```bash
# Crear una nueva rama de característica
git checkout -b feature/nueva-caracteristica

# Iniciar servicios relevantes para tu característica
npm run start:gateway
npm run start:access-service    # si trabajas en características de auth
npm run start:products-service  # si trabajas en características de productos

# Hacer tus cambios y probar
npm run test
npm run lint

# Construir para asegurar que todo compila
npm run build:all
```

### 2. Generación de Código

```bash
# Generar un nuevo componente Angular
nx g @nx/angular:component nombre-caracteristica --project=manager-app

# Generar un nuevo módulo NestJS
nx g @nx/nest:module nombre-caracteristica --project=access-service

# Generar un nuevo servicio
nx g @nx/nest:service nombre-caracteristica --project=access-service

# Generar una nueva biblioteca
nx g @nx/js:library nombre-caracteristica-compartida
```

### 3. Testing

```bash
# Ejecutar todos los tests
npm run test:all

# Ejecutar tests para proyecto específico
nx test manager-app
nx test access-service

# Ejecutar tests e2e
nx e2e manager-app-e2e

# Modo watch para desarrollo
nx test manager-app --watch
```

### 4. Operaciones de Base de Datos

```bash
# Generar una nueva migración
nx run access-service:migration:generate --name=AddUserTable

# Ejecutar migraciones
nx run access-service:migration:run

# Revertir última migración
nx run access-service:migration:revert

# Mostrar estado de migración
nx run access-service:migration:show
```

## Directrices de Arquitectura

### 1. Implementación de Arquitectura Hexagonal

Cada servicio sigue los principios de arquitectura hexagonal:

```
Service/
├── domain/              # Lógica de negocio (centro)
│   ├── entities/       # Entidades de dominio
│   ├── value-objects/  # Objetos de valor
│   ├── aggregates/     # Aggregate roots
│   ├── repositories/   # Interfaces de repositorio
│   └── services/       # Servicios de dominio
├── application/         # Casos de uso (capa de aplicación)
│   ├── commands/       # Command handlers (CQRS)
│   ├── queries/        # Query handlers (CQRS)
│   ├── events/         # Event handlers
│   └── dto/            # Objetos de transferencia de datos
└── infrastructure/     # Adaptadores externos
    ├── persistence/    # Implementaciones de base de datos
    ├── messaging/      # Implementaciones de bus de eventos
    ├── external/       # Integraciones con terceros
    └── web/           # Controladores HTTP
```

### 2. Implementación del Patrón CQRS

```typescript
// Ejemplo de Comando
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<void> {
    const user = User.create(command.userData);
    await this.userRepository.save(user);
    
    // Publicar evento de dominio
    await this.eventBus.publish(new UserCreatedEvent(user.id, user.email));
  }
}

// Ejemplo de Query
@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetUserQuery): Promise<UserDto> {
    return this.userReadModel.findById(query.userId);
  }
}
```

## Configuración de Variables de Entorno

### Entorno de Desarrollo

Crear archivo `.env.development`:

```env
# Base de Datos
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=enterprise_commerce_dev
DATABASE_USERNAME=app_user
DATABASE_PASSWORD=app_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_BULLMQ_HOST=localhost
REDIS_BULLMQ_PORT=6380

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=enterprise-commerce
KEYCLOAK_CLIENT_ID=backend-service

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
```

## Directrices de Desarrollo Angular

### 1. Arquitectura de Componentes

```typescript
// Componente standalone con signals
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  template: `
    <p-table [value]="products()" [loading]="loading()">
      <!-- contenido de tabla -->
    </p-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  // Signals para estado reactivo
  products = signal<Product[]>([]);
  loading = signal(false);
  
  // Computed signals
  totalProducts = computed(() => this.products().length);
  
  constructor(private productService: ProductService) {}
  
  async loadProducts(): Promise<void> {
    this.loading.set(true);
    try {
      const products = await this.productService.getProducts();
      this.products.set(products);
    } finally {
      this.loading.set(false);
    }
  }
}
```

## Directrices de Desarrollo NestJS

### 1. Estructura de Módulos

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    CqrsModule,
    BullModule.registerQueue({
      name: 'user-processing',
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    // Command Handlers
    CreateUserCommandHandler,
    UpdateUserCommandHandler,
    // Query Handlers
    GetUserQueryHandler,
    GetUsersQueryHandler,
    // Event Handlers
    UserCreatedEventHandler,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
```

## Directrices de Testing

### 1. Testing Unitario

```typescript
// Test de servicio
describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            save: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
  });

  it('debería crear un usuario', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };
    const expectedUser = new User(userData);
    
    repository.save.mockResolvedValue(expectedUser);

    const result = await service.createUser(userData);

    expect(repository.save).toHaveBeenCalledWith(expect.any(User));
    expect(result).toEqual(expectedUser);
  });
});
```

## Comandos para Empezar

```bash
# 1. Clonar e instalar dependencias
git clone <repository-url>
cd enterprise-commerce-platform
npm install

# 2. Iniciar servicios de infraestructura
docker-compose up -d mysql redis redis-bullmq minio keycloak

# 3. Iniciar entorno de desarrollo
npm run dev

# 4. Ejecutar tests del Products Service
nx test products-service

# 5. Construir Products Service
nx build products-service
```

## Recursos Clave

- **Documentación Principal**: `/docs/es/README.md`
- **Guía de Arquitectura**: `/docs/es/architecture.md`
- **Requisitos Funcionales**: `/docs/es/functional-objectives.md`
- **Estado del Proyecto**: `/docs/es/project-status.md`
- **Configuración Docker**: `/docker-compose.yml`

---

¡Feliz programación! 🚀