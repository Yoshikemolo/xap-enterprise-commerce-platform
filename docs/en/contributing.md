# Contributing Guide

Welcome to the Enterprise Commerce Platform! We're excited that you're interested in contributing. This guide will help you get started and ensure that your contributions align with our project standards.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Architecture Guidelines](#architecture-guidelines)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Release Process](#release-process)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, experience level, or identity.

### Expected Behavior

- **Be respectful** and considerate in all interactions
- **Be collaborative** and help others learn and grow
- **Be constructive** when providing feedback
- **Be patient** with newcomers and those learning
- **Focus on what's best** for the project and community

### Unacceptable Behavior

- Harassment, discrimination, or offensive language
- Personal attacks or trolling
- Spam or irrelevant promotional content
- Sharing private information without permission

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** latest version
- **Docker** and **Docker Compose** for infrastructure

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/enterprise-commerce-platform.git
   cd enterprise-commerce-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start infrastructure services**
   ```bash
   docker-compose up -d mysql redis minio keycloak
   ```

4. **Verify setup**
   ```bash
   npm run test
   npm run lint
   ```

### Project Structure Understanding

Before contributing, familiarize yourself with our architecture:

- **Apps**: Frontend applications and API gateway
- **Libs**: Microservices and shared libraries
- **Infrastructure**: Docker, monitoring, deployment configs
- **Docs**: Documentation and guides

## 🔄 Development Workflow

### Branch Strategy

We follow **GitFlow** with these branch types:

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: New features or enhancements
- **`bugfix/*`**: Bug fixes
- **`hotfix/*`**: Critical production fixes
- **`chore/*`**: Maintenance tasks

### Feature Development Process

1. **Create a feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow our coding standards
   - Write tests for new functionality
   - Update documentation as needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description of changes"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create PR via GitHub interface
   ```

### Commit Message Convention

We use **Conventional Commits** format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style/formatting
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `chore`: Maintenance tasks

**Scopes:**
- `access-service`: Authentication & authorization
- `products-service`: Product management
- `commerce-service`: Commerce logic
- `shared`: Shared libraries
- `docs`: Documentation
- `infra`: Infrastructure

**Examples:**
```bash
feat(access-service): implement user role assignment
fix(products-service): resolve inventory calculation bug
docs(contributing): add development workflow section
```

## 🏗️ Architecture Guidelines

### CQRS Pattern (Required)

All services must implement **CQRS** (Command Query Responsibility Segregation):

#### Commands (Write Operations)
```typescript
// Command definition
export class CreateUserCommand implements ICommand {
  constructor(
    public readonly userData: CreateUserData,
    public readonly createdBy: string
  ) {}
}

// Command handler
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand, User> {
  async execute(command: CreateUserCommand): Promise<User> {
    // Implementation
  }
}
```

#### Queries (Read Operations)
```typescript
// Query definition
export class GetUserByIdQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

// Query handler
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery, UserDto> {
  async execute(query: GetUserByIdQuery): Promise<UserDto> {
    // Implementation
  }
}
```

### Domain-Driven Design (DDD)

#### Entity Structure
```typescript
export class User extends AggregateRootImpl {
  private _email: Email;
  private _firstName: string;
  
  constructor(props: UserProps) {
    super(props.id, props.uuid);
    this._email = new Email(props.email);
    // ... other properties
  }
  
  // Business methods
  updateProfile(firstName: string, lastName: string): void {
    // Business logic
    this.addEvent(new UserUpdatedEvent(this.id, { firstName, lastName }));
  }
}
```

#### Repository Pattern
```typescript
export interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>;
  findActiveUsers(options?: QueryOptions): Promise<User[]>;
}
```

### Event Sourcing

All domain changes must emit events:

```typescript
// Domain event
export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly userData: UserEventData
  ) {
    super('UserCreated', userId);
  }
}

// Event handler
@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler {
  async handle(event: UserCreatedEvent): Promise<void> {
    // Handle event
  }
}
```

### Hexagonal Architecture

Maintain clear separation between layers:

```
src/
├── application/           # Commands, Queries, Services
│   ├── commands/
│   ├── queries/
│   ├── dto/
│   └── services/
├── domain/               # Entities, Value Objects, Events
│   ├── entities/
│   ├── value-objects/
│   └── repositories/
└── infrastructure/       # External concerns
    ├── persistence/
    ├── web/
    └── messaging/
```

## 💻 Coding Standards

### TypeScript Guidelines

#### General Rules
- Use **strict TypeScript** mode
- Prefer **interfaces** over types for object shapes
- Use **enums** for constants with multiple values
- Always define **return types** for functions

#### Naming Conventions
```typescript
// Classes: PascalCase
class UserApplicationService {}

// Interfaces: PascalCase with 'I' prefix for domain interfaces
interface IUserRepository {}
interface UserDto {} // DTOs don't need 'I' prefix

// Functions/methods: camelCase
async createUser(userData: CreateUserData): Promise<User> {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;

// Enums: PascalCase
enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Locked = 'locked'
}
```

#### Error Handling
```typescript
// Use custom domain exceptions
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Handle errors appropriately
try {
  const user = await this.userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User', userId);
  }
} catch (error) {
  if (error instanceof NotFoundError) {
    // Handle specific error
  }
  throw error; // Re-throw if not handled
}
```

### Angular Guidelines

#### Component Structure
```typescript
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, PrimeNGModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  // Signals for reactive state
  users = signal<User[]>([]);
  loading = signal(false);
  
  // Computed values
  activeUsers = computed(() => 
    this.users().filter(user => user.isActive)
  );
  
  constructor(
    private userService: UserService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  private async loadUsers(): Promise<void> {
    this.loading.set(true);
    try {
      const users = await this.userService.getUsers();
      this.users.set(users);
    } finally {
      this.loading.set(false);
    }
  }
}
```

#### Service Structure
```typescript
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';
  
  constructor(private http: HttpClient) {}
  
  async getUsers(): Promise<User[]> {
    return firstValueFrom(
      this.http.get<User[]>(this.apiUrl)
    );
  }
}
```

### NestJS Guidelines

#### Controller Structure
```typescript
@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(
    private userApplicationService: UserApplicationService
  ) {}
  
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: AuthUser
  ): Promise<UserResponseDto> {
    return this.userApplicationService.createUser(
      createUserDto, 
      currentUser.id
    );
  }
}
```

#### Module Structure
```typescript
@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    UserApplicationService,
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [UserApplicationService],
})
export class UserModule {}
```

## 🧪 Testing Requirements

### Test Structure

We require comprehensive testing at multiple levels:

#### Unit Tests
```typescript
describe('UserApplicationService', () => {
  let service: UserApplicationService;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserApplicationService,
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();
    
    service = module.get<UserApplicationService>(UserApplicationService);
  });
  
  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const createUserDto = { /* test data */ };
      const expectedUser = { /* expected result */ };
      
      // Act
      const result = await service.createUser(createUserDto, 'admin');
      
      // Assert
      expect(result).toEqual(expectedUser);
    });
  });
});
```

#### Integration Tests
```typescript
describe('User API Integration', () => {
  let app: INestApplication;
  
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
  });
  
  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .expect((res) => {
        expect(res.body.email).toBe(createUserDto.email);
      });
  });
});
```

#### Frontend Tests
```typescript
describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: jasmine.SpyObj<UserService>;
  
  beforeEach(() => {
    const spy = jasmine.createSpyObj('UserService', ['getUsers']);
    
    TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        { provide: UserService, useValue: spy }
      ]
    });
    
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });
  
  it('should load users on init', async () => {
    const mockUsers = [/* test data */];
    userService.getUsers.and.returnValue(Promise.resolve(mockUsers));
    
    await component.ngOnInit();
    
    expect(component.users()).toEqual(mockUsers);
  });
});
```

### Test Coverage Requirements

- **Unit Tests**: Minimum 80% coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows
- **Performance Tests**: Load testing for key operations

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e

# Run specific service tests
nx test access-service
```

## 📚 Documentation Standards

### Code Documentation

#### JSDoc for Complex Functions
```typescript
/**
 * Creates a new user with the specified role assignments
 * 
 * @param userData - The user data for creation
 * @param createdBy - ID of the user creating this account
 * @param roles - Optional array of role names to assign
 * @returns Promise resolving to the created user
 * 
 * @throws {ValidationError} When user data is invalid
 * @throws {ConflictError} When user email already exists
 * 
 * @example
 * ```typescript
 * const user = await createUser({
 *   email: 'john@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * }, 'admin-id', ['user']);
 * ```
 */
async createUser(
  userData: CreateUserData,
  createdBy: string,
  roles?: string[]
): Promise<User> {
  // Implementation
}
```

#### README Files for Services
Each service must have a comprehensive README:

```markdown
# Access Service

## Overview
Brief description of the service's purpose and capabilities.

## Architecture
- CQRS implementation details
- Domain entities
- Key patterns used

## API Documentation
Links to OpenAPI/GraphQL documentation

## Setup & Configuration
Development setup instructions

## Testing
How to run tests for this service
```

### API Documentation

#### OpenAPI/Swagger for REST APIs
```typescript
@ApiOperation({
  summary: 'Create a new user',
  description: 'Creates a new user account with specified roles and permissions'
})
@ApiBody({
  type: CreateUserDto,
  description: 'User creation data',
  examples: {
    standard: {
      summary: 'Standard user creation',
      value: {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['user']
      }
    }
  }
})
@ApiResponse({
  status: 201,
  description: 'User created successfully',
  type: UserResponseDto
})
@ApiResponse({
  status: 409,
  description: 'Email already exists'
})
```

#### GraphQL Schema Documentation
```graphql
"""
User entity representing a system user
"""
type User {
  """Unique identifier for the user"""
  id: ID!
  
  """User's email address (must be unique)"""
  email: String!
  
  """User's first name"""
  firstName: String!
  
  """User's last name"""
  lastName: String!
  
  """Whether the user account is active"""
  isActive: Boolean!
}
```

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure your branch is up to date**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-feature-branch
   git rebase develop
   ```

2. **Run quality checks**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

3. **Update documentation**
   - Update relevant README files
   - Add/update API documentation
   - Update architecture docs if needed

### PR Requirements

#### Title Format
```
<type>(<scope>): <description>

Examples:
feat(access-service): implement role-based permissions
fix(products-service): resolve inventory sync issue
docs(contributing): add testing guidelines
```

#### PR Description Template
```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Ready for review

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Closes #123
Fixes #456
```

### Review Process

#### Automatic Checks
- **CI/CD Pipeline**: Must pass all automated tests
- **Code Quality**: SonarQube analysis must pass
- **Security**: No security vulnerabilities detected
- **Performance**: No significant performance regressions

#### Manual Review Requirements
- **At least 2 approvals** for feature changes
- **At least 1 approval** for bug fixes and documentation
- **Architecture review** for significant changes
- **Security review** for authentication/authorization changes

#### Review Criteria
- **Code Quality**: Follows coding standards
- **Architecture**: Aligns with project patterns
- **Testing**: Adequate test coverage
- **Documentation**: Changes are documented
- **Performance**: No performance regressions
- **Security**: No security vulnerabilities

### Merge Requirements

- ✅ All automated checks passing
- ✅ Required approvals received
- ✅ Branch up to date with target
- ✅ No merge conflicts
- ✅ Documentation updated

## 🐛 Issue Guidelines

### Bug Reports

Use the bug report template:

```markdown
## Bug Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Node.js: [e.g., 18.0.0]
- Service: [e.g., access-service]

## Screenshots
Add screenshots if applicable.

## Additional Context
Any other relevant information.
```

### Feature Requests

Use the feature request template:

```markdown
## Feature Description
Clear description of the requested feature.

## Business Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternative Solutions
Other approaches considered.

## Additional Context
Mockups, examples, or related issues.
```

### Issue Labels

- **Type**: `bug`, `feature`, `enhancement`, `documentation`
- **Priority**: `low`, `medium`, `high`, `critical`
- **Status**: `triage`, `in-progress`, `blocked`, `ready-for-review`
- **Component**: `access-service`, `products-service`, `frontend`, `infrastructure`

## 🚀 Release Process

### Version Management

We follow **Semantic Versioning** (SemVer):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features (backward compatible)
- **PATCH** (0.0.1): Bug fixes (backward compatible)

### Release Workflow

1. **Feature Freeze**: No new features in release branch
2. **Testing Phase**: Comprehensive testing of release candidate
3. **Documentation Update**: Ensure all docs are current
4. **Release Notes**: Detailed changelog preparation
5. **Deployment**: Staged deployment to production

### Changelog Format

```markdown
# Changelog

## [1.2.0] - 2025-06-19

### Added
- New user role management system
- Advanced permission conditions
- Security analytics dashboard

### Changed
- Improved query performance for large datasets
- Updated UI components to PrimeNG 17

### Fixed
- Memory leak in event processing
- Race condition in user authentication

### Security
- Enhanced password policy validation
- Improved session management

### Breaking Changes
- Removed deprecated API endpoints
- Changed authentication token format
```

## 🏆 Recognition

### Contributor Recognition

We recognize valuable contributions through:

- **Monthly Contributor Highlights**
- **Annual Contributor Awards**
- **Social Media Recognition**
- **Conference Speaking Opportunities**

### Types of Contributions Valued

- **Code Contributions**: Features, bug fixes, performance improvements
- **Documentation**: Guides, tutorials, API documentation
- **Testing**: Test improvements, bug finding, quality assurance
- **Design**: UX/UI improvements, accessibility enhancements
- **Community**: Helping other contributors, issue triage

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: Technical questions and bug reports
- **GitHub Discussions**: General questions and ideas
- **Team Slack**: Real-time collaboration (invite required)
- **Email**: maintainers@enterprise-platform.com

### Mentorship Program

New contributors can request mentorship for:

- **Architecture Understanding**: Learning the system design
- **Development Setup**: Getting environment configured
- **First Contribution**: Guidance on initial pull request
- **Best Practices**: Learning project conventions

### Documentation Resources

- **Architecture Guide**: [/docs/en/architecture.md](./architecture.md)
- **Development Guide**: [/docs/en/development.md](./development.md)
- **Troubleshooting Guide**: [/docs/en/troubleshooting.md](./troubleshooting.md)
- **FAQ**: [/docs/en/faq.md](./faq.md)
- **API Documentation**: Generated from code annotations
- **Video Tutorials**: Available in project wiki

## 📝 Legal

### Contributor License Agreement

By contributing to this project, you agree that:

1. **You own the rights** to your contribution
2. **You grant us rights** to use your contribution
3. **Your contribution is original** work
4. **You understand** this is an open-source project

### License Compliance

- All contributions must be compatible with MIT License
- Include proper attribution for third-party code
- Ensure no proprietary or copyrighted code is included

---

## 🙏 Thank You

Thank you for taking the time to contribute to the Enterprise Commerce Platform! Your contributions help make this project better for everyone.

**Happy coding!** 🚀

---

*This contributing guide is a living document and may be updated to reflect the evolving needs of the project.*
