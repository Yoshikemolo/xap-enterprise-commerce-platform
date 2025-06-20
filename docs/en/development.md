# Development Guide - Enterprise Commerce Platform

## Prerequisites

Before starting development, ensure you have the following installed:

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **Docker** v20.0.0 or higher
- **Docker Compose** v2.0.0 or higher
- **MySQL** v8.0 (or use Docker container)
- **Redis** v7.0 (or use Docker container)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd enterprise-commerce-platform
npm install
```

### 2. Start Infrastructure Services

```bash
# Start only infrastructure services
docker-compose up -d mysql redis redis-bullmq minio keycloak prometheus grafana jaeger

# Wait for services to be ready (check health status)
docker-compose ps
```

### 3. Database Setup

```bash
# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 4. Start Development Environment

```bash
# Start all services in development mode
npm run dev

# Or start services individually:
npm run start:gateway    # API Gateway (port 3000)
npm run start:manager    # Manager App (port 4200)
npm run start:customer   # Customer App (port 4201)
npm run start:services   # All microservices
```

## Project Structure

```
enterprise-commerce-platform/
├── apps/                           # Applications
│   ├── manager-app/               # Administrative Angular SPA
│   │   ├── src/
│   │   │   ├── app/              # Application modules
│   │   │   ├── assets/           # Static assets
│   │   │   ├── environments/     # Environment configurations
│   │   │   └── styles/          # Global styles
│   │   ├── Dockerfile
│   │   └── project.json
│   ├── customer-app/             # Customer-facing Angular SPA
│   │   └── ... (similar structure)
│   └── api-gateway/              # GraphQL Federation Gateway
│       ├── src/
│       │   ├── app/             # Gateway modules
│       │   ├── config/          # Configuration
│       │   └── main.ts          # Bootstrap
│       ├── Dockerfile
│       └── project.json
├── libs/                           # Libraries and Services
│   ├── shared/                   # Shared utilities and types
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── types/       # Common TypeScript interfaces
│   │   │   │   ├── utils/       # Utility functions
│   │   │   │   ├── constants/   # Application constants
│   │   │   │   └── decorators/  # Custom decorators
│   │   │   └── index.ts
│   │   └── project.json
│   ├── access-service/           # Authentication & Authorization
│   │   ├── src/
│   │   │   ├── app/             # NestJS modules
│   │   │   ├── domain/          # Domain models and logic
│   │   │   ├── infrastructure/  # External adapters
│   │   │   ├── application/     # Use cases and DTOs
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   └── project.json
│   ├── products-service/         # Product Management
│   ├── commerce-service/         # Orders & Commerce Logic
│   ├── scheduling-service/       # Events & Notifications
│   └── business-service/         # Analytics & Reporting
├── tools/                        # Build and deployment tools
├── infrastructure/               # Infrastructure configurations
│   ├── haproxy/                 # Load balancer config
│   ├── mysql/                   # Database initialization
│   ├── prometheus/              # Monitoring configuration
│   └── grafana/                 # Dashboard configurations
├── docs/                        # Documentation
└── dist/                        # Build outputs
```

## Development Workflow

### 1. Feature Development

```bash
# Create a new feature branch
git checkout -b feature/new-feature-name

# Start relevant services for your feature
npm run start:gateway
npm run start:access-service  # if working on auth features
npm run start:products-service  # if working on product features

# Make your changes and test
npm run test
npm run lint

# Build to ensure everything compiles
npm run build:all
```

### 2. Code Generation

```bash
# Generate a new Angular component
nx g @nx/angular:component feature-name --project=manager-app

# Generate a new NestJS module
nx g @nx/nest:module feature-name --project=access-service

# Generate a new service
nx g @nx/nest:service feature-name --project=access-service

# Generate a new library
nx g @nx/js:library shared-feature-name
```

### 3. Testing

```bash
# Run all tests
npm run test:all

# Run tests for specific project
nx test manager-app
nx test access-service

# Run e2e tests
nx e2e manager-app-e2e

# Watch mode for development
nx test manager-app --watch
```

### 4. Database Operations

```bash
# Generate a new migration
nx run access-service:migration:generate --name=AddUserTable

# Run migrations
nx run access-service:migration:run

# Revert last migration
nx run access-service:migration:revert

# Show migration status
nx run access-service:migration:show
```

## Architecture Guidelines

### 1. Hexagonal Architecture Implementation

Each service follows hexagonal architecture principles:

```
Service/
├── domain/              # Business logic (center)
│   ├── entities/       # Domain entities
│   ├── value-objects/  # Value objects
│   ├── aggregates/     # Aggregate roots
│   ├── repositories/   # Repository interfaces
│   └── services/       # Domain services
├── application/         # Use cases (application layer)
│   ├── commands/       # Command handlers (CQRS)
│   ├── queries/        # Query handlers (CQRS)
│   ├── events/         # Event handlers
│   └── dto/            # Data transfer objects
└── infrastructure/     # External adapters
    ├── persistence/    # Database implementations
    ├── messaging/      # Event bus implementations
    ├── external/       # Third-party integrations
    └── web/           # HTTP controllers
```

### 2. CQRS Pattern Implementation

```typescript
// Command Example
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<void> {
    const user = User.create(command.userData);
    await this.userRepository.save(user);
    
    // Publish domain event
    await this.eventBus.publish(new UserCreatedEvent(user.id, user.email));
  }
}

// Query Example
@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetUserQuery): Promise<UserDto> {
    return this.userReadModel.findById(query.userId);
  }
}
```

### 3. Event-Driven Communication

```typescript
// Event Publisher (Outbox Pattern)
@Injectable()
export class EventPublisher {
  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly messageBus: MessageBus,
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    // Store in outbox first
    await this.outboxRepository.save(event);
    
    // Publish to message bus
    await this.messageBus.publish(event);
  }
}

// Event Subscriber (Inbox Pattern)
@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler implements IEventHandler<UserCreatedEvent> {
  constructor(private readonly inboxRepository: InboxRepository) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    // Check if already processed (idempotency)
    if (await this.inboxRepository.exists(event.id)) {
      return;
    }

    // Process event
    await this.processUserCreation(event);
    
    // Mark as processed
    await this.inboxRepository.markProcessed(event.id);
  }
}
```

## Environment Configuration

### Development Environment Variables

Create `.env.development` file:

```env
# Database
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

# Monitoring
JAEGER_ENDPOINT=http://localhost:14268/api/traces
PROMETHEUS_ENDPOINT=http://localhost:9090

# API Endpoints
API_GATEWAY_URL=http://localhost:3000
ACCESS_SERVICE_URL=http://localhost:3002
PRODUCTS_SERVICE_URL=http://localhost:3003
COMMERCE_SERVICE_URL=http://localhost:3004
SCHEDULING_SERVICE_URL=http://localhost:3005
BUSINESS_SERVICE_URL=http://localhost:3006
```

## Angular Development Guidelines

### 1. Component Architecture

```typescript
// Standalone component with signals
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  template: `
    <p-table [value]="products()" [loading]="loading()">
      <!-- table content -->
    </p-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  // Signals for reactive state
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

### 2. State Management with Redux Pattern

```typescript
// State slice
export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

// Actions
export const ProductActions = createActionGroup({
  source: 'Product',
  events: {
    'Load Products': emptyProps(),
    'Load Products Success': props<{ products: Product[] }>(),
    'Load Products Failure': props<{ error: string }>(),
  },
});

// Reducer
export const productReducer = createReducer(
  initialState,
  on(ProductActions.loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductActions.loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false,
  })),
);

// Effects
@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      switchMap(() =>
        this.productService.getProducts().pipe(
          map((products) => ProductActions.loadProductsSuccess({ products })),
          catchError((error) => of(ProductActions.loadProductsFailure({ error: error.message })))
        )
      )
    )
  );
}
```

## NestJS Development Guidelines

### 1. Module Structure

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
    // Sagas
    UserRegistrationSaga,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
```

### 2. GraphQL Schema Definition

```typescript
// GraphQL Resolver
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => User)
  async user(@Args('id') id: string): Promise<User> {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.commandBus.execute(new CreateUserCommand(input));
  }

  @ResolveField(() => [Order])
  async orders(@Parent() user: User): Promise<Order[]> {
    return this.queryBus.execute(new GetUserOrdersQuery(user.id));
  }
}

// GraphQL Types
@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => [Order])
  orders: Order[];
}
```

## Testing Guidelines

### 1. Unit Testing

```typescript
// Service test
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

  it('should create a user', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };
    const expectedUser = new User(userData);
    
    repository.save.mockResolvedValue(expectedUser);

    const result = await service.createUser(userData);

    expect(repository.save).toHaveBeenCalledWith(expect.any(User));
    expect(result).toEqual(expectedUser);
  });
});
```

### 2. Integration Testing

```typescript
// Controller integration test
describe('UserController (Integration)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get('UserEntityRepository');
    
    await app.init();
  });

  it('/users (POST)', async () => {
    const createUserDto = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    return request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .expect((res) => {
        expect(res.body.email).toBe(createUserDto.email);
        expect(res.body.id).toBeDefined();
      });
  });
});
```

## Debugging

### 1. VS Code Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API Gateway",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/apps/api-gateway/main.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug Access Service",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/libs/access-service/main.js",
      "env": {
        "NODE_ENV": "development",
        "PORT": "3002"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

### 2. Logging Configuration

```typescript
// Logger setup with OpenTelemetry
import { Logger } from '@nestjs/common';
import { trace, context } from '@opentelemetry/api';

@Injectable()
export class AppLogger extends Logger {
  log(message: string, context?: string) {
    const span = trace.getActiveSpan();
    const traceId = span?.spanContext().traceId;
    
    super.log(`[${traceId}] ${message}`, context);
  }
}
```

## Deployment

### 1. Build for Production

```bash
# Build all applications
npm run build:all

# Build specific application
nx build manager-app --prod
nx build api-gateway --prod
```

### 2. Docker Deployment

```bash
# Build Docker images
npm run docker:build

# Start production environment
npm run docker:up

# Check logs
docker-compose logs -f api-gateway
```

## Contributing

1. Follow the coding standards defined in `.eslintrc.json`
2. Write tests for all new features
3. Update documentation for any API changes
4. Use conventional commits for commit messages
5. Ensure all CI checks pass before merging

## Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports are already in use
2. **Database connection**: Ensure MySQL is running and accessible
3. **Redis connection**: Verify Redis services are healthy
4. **Build errors**: Clear node_modules and reinstall dependencies
5. **TypeScript errors**: Check path mappings in tsconfig.base.json

### Getting Help

- Check the [documentation](./docs/)
- Review [architecture guidelines](./docs/architecture.md)
- Open an issue for bugs or feature requests
- Contact the development team for urgent issues

---

Happy coding! 🚀