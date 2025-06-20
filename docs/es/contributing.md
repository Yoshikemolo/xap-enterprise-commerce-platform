# Guía de Contribución

¡Bienvenido a la Enterprise Commerce Platform! Nos emociona que estés interesado en contribuir. Esta guía te ayudará a comenzar y asegurar que tus contribuciones se alineen con los estándares del proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Primeros Pasos](#primeros-pasos)
- [Flujo de Desarrollo](#flujo-de-desarrollo)
- [Pautas de Arquitectura](#pautas-de-arquitectura)
- [Estándares de Codificación](#estándares-de-codificación)
- [Requisitos de Testing](#requisitos-de-testing)
- [Estándares de Documentación](#estándares-de-documentación)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Pautas para Issues](#pautas-para-issues)
- [Proceso de Release](#proceso-de-release)

## 🤝 Código de Conducta

### Nuestro Compromiso

Estamos comprometidos a proporcionar un entorno acogedor e inclusivo para todos los contribuidores, independientemente de su origen, nivel de experiencia o identidad.

### Comportamiento Esperado

- **Ser respetuoso** y considerado en todas las interacciones
- **Ser colaborativo** y ayudar a otros a aprender y crecer
- **Ser constructivo** al proporcionar feedback
- **Ser paciente** con los recién llegados y aquellos que están aprendiendo
- **Enfocarse en lo que es mejor** para el proyecto y la comunidad

### Comportamiento Inaceptable

- Acoso, discriminación o lenguaje ofensivo
- Ataques personales o trolling
- Spam o contenido promocional irrelevante
- Compartir información privada sin permiso

## 🚀 Primeros Pasos

### Prerequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** última versión
- **Docker** y **Docker Compose** para infraestructura

### Configuración Inicial

1. **Hacer fork del repositorio**
   ```bash
   # Haz clic en "Fork" en GitHub, luego clona tu fork
   git clone https://github.com/TU_USUARIO/enterprise-commerce-platform.git
   cd enterprise-commerce-platform
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar servicios de infraestructura**
   ```bash
   docker-compose up -d mysql redis minio keycloak
   ```

4. **Verificar configuración**
   ```bash
   npm run test
   npm run lint
   ```

### Entendimiento de la Estructura del Proyecto

Antes de contribuir, familiarízate con nuestra arquitectura:

- **Apps**: Aplicaciones frontend y API gateway
- **Libs**: Microservicios y librerías compartidas
- **Infrastructure**: Docker, monitoreo, configuraciones de despliegue
- **Docs**: Documentación y guías

## 🔄 Flujo de Desarrollo

### Estrategia de Ramas

Seguimos **GitFlow** con estos tipos de ramas:

- **`main`**: Código listo para producción
- **`develop`**: Rama de integración para features
- **`feature/*`**: Nuevas características o mejoras
- **`bugfix/*`**: Corrección de bugs
- **`hotfix/*`**: Correcciones críticas de producción
- **`chore/*`**: Tareas de mantenimiento

### Proceso de Desarrollo de Features

1. **Crear una rama feature**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nombre-de-tu-feature
   ```

2. **Realizar tus cambios**
   - Seguir nuestros estándares de codificación
   - Escribir tests para nueva funcionalidad
   - Actualizar documentación según sea necesario

3. **Confirmar tus cambios**
   ```bash
   git add .
   git commit -m "feat(scope): descripción de los cambios"
   ```

4. **Push y crear PR**
   ```bash
   git push origin feature/nombre-de-tu-feature
   # Crear PR a través de la interfaz de GitHub
   ```

### Convención de Mensajes de Commit

Usamos el formato **Conventional Commits**:

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer(s) opcional(es)]
```

**Tipos:**
- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Estilo de código/formateo
- `refactor`: Refactorización de código
- `test`: Adiciones/modificaciones de tests
- `chore`: Tareas de mantenimiento

**Scopes:**
- `access-service`: Autenticación y autorización
- `products-service`: Gestión de productos
- `commerce-service`: Lógica de comercio
- `shared`: Librerías compartidas
- `docs`: Documentación
- `infra`: Infraestructura

**Ejemplos:**
```bash
feat(access-service): implementar asignación de roles de usuario
fix(products-service): resolver bug de cálculo de inventario
docs(contributing): agregar sección de flujo de desarrollo
```

## 🏗️ Pautas de Arquitectura

### Patrón CQRS (Requerido)

Todos los servicios deben implementar **CQRS** (Command Query Responsibility Segregation):

#### Comandos (Operaciones de Escritura)
```typescript
// Definición de comando
export class CreateUserCommand implements ICommand {
  constructor(
    public readonly userData: CreateUserData,
    public readonly createdBy: string
  ) {}
}

// Manejador de comando
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand, User> {
  async execute(command: CreateUserCommand): Promise<User> {
    // Implementación
  }
}
```

#### Queries (Operaciones de Lectura)
```typescript
// Definición de query
export class GetUserByIdQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

// Manejador de query
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery, UserDto> {
  async execute(query: GetUserByIdQuery): Promise<UserDto> {
    // Implementación
  }
}
```

### Domain-Driven Design (DDD)

#### Estructura de Entidad
```typescript
export class User extends AggregateRootImpl {
  private _email: Email;
  private _firstName: string;
  
  constructor(props: UserProps) {
    super(props.id, props.uuid);
    this._email = new Email(props.email);
    // ... otras propiedades
  }
  
  // Métodos de negocio
  updateProfile(firstName: string, lastName: string): void {
    // Lógica de negocio
    this.addEvent(new UserUpdatedEvent(this.id, { firstName, lastName }));
  }
}
```

#### Patrón Repository
```typescript
export interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>;
  findActiveUsers(options?: QueryOptions): Promise<User[]>;
}
```

### Event Sourcing

Todos los cambios de dominio deben emitir eventos:

```typescript
// Evento de dominio
export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly userData: UserEventData
  ) {
    super('UserCreated', userId);
  }
}

// Manejador de evento
@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler {
  async handle(event: UserCreatedEvent): Promise<void> {
    // Manejar evento
  }
}
```

### Arquitectura Hexagonal

Mantener separación clara entre capas:

```
src/
├── application/           # Comandos, Queries, Servicios
│   ├── commands/
│   ├── queries/
│   ├── dto/
│   └── services/
├── domain/               # Entidades, Value Objects, Eventos
│   ├── entities/
│   ├── value-objects/
│   └── repositories/
└── infrastructure/       # Preocupaciones externas
    ├── persistence/
    ├── web/
    └── messaging/
```

## 💻 Estándares de Codificación

### Pautas de TypeScript

#### Reglas Generales
- Usar modo **strict TypeScript**
- Preferir **interfaces** sobre types para formas de objetos
- Usar **enums** para constantes con múltiples valores
- Siempre definir **tipos de retorno** para funciones

#### Convenciones de Nomenclatura
```typescript
// Clases: PascalCase
class UserApplicationService {}

// Interfaces: PascalCase con prefijo 'I' para interfaces de dominio
interface IUserRepository {}
interface UserDto {} // Los DTOs no necesitan prefijo 'I'

// Funciones/métodos: camelCase
async createUser(userData: CreateUserData): Promise<User> {}

// Constantes: SCREAMING_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;

// Enums: PascalCase
enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Locked = 'locked'
}
```

#### Manejo de Errores
```typescript
// Usar excepciones de dominio personalizadas
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Manejar errores apropiadamente
try {
  const user = await this.userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User', userId);
  }
} catch (error) {
  if (error instanceof NotFoundError) {
    // Manejar error específico
  }
  throw error; // Re-lanzar si no se maneja
}
```

### Pautas de Angular

#### Estructura de Componente
```typescript
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, PrimeNGModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  // Signals para estado reactivo
  users = signal<User[]>([]);
  loading = signal(false);
  
  // Valores computados
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

#### Estructura de Servicio
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

### Pautas de NestJS

#### Estructura de Controlador
```typescript
@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(
    private userApplicationService: UserApplicationService
  ) {}
  
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
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

#### Estructura de Módulo
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

## 🧪 Requisitos de Testing

### Estructura de Tests

Requerimos testing comprehensivo en múltiples niveles:

#### Tests Unitarios
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
      const createUserDto = { /* datos de prueba */ };
      const expectedUser = { /* resultado esperado */ };
      
      // Act
      const result = await service.createUser(createUserDto, 'admin');
      
      // Assert
      expect(result).toEqual(expectedUser);
    });
  });
});
```

#### Tests de Integración
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

#### Tests de Frontend
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
    const mockUsers = [/* datos de prueba */];
    userService.getUsers.and.returnValue(Promise.resolve(mockUsers));
    
    await component.ngOnInit();
    
    expect(component.users()).toEqual(mockUsers);
  });
});
```

### Requisitos de Cobertura de Tests

- **Tests Unitarios**: Mínimo 80% de cobertura
- **Tests de Integración**: Todos los endpoints de API
- **Tests E2E**: Flujos críticos de usuario
- **Tests de Performance**: Pruebas de carga para operaciones clave

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests e2e
npm run test:e2e

# Ejecutar tests de un servicio específico
nx test access-service
```

## 📚 Estándares de Documentación

### Documentación de Código

#### JSDoc para Funciones Complejas
```typescript
/**
 * Crea un nuevo usuario con las asignaciones de rol especificadas
 * 
 * @param userData - Los datos del usuario para la creación
 * @param createdBy - ID del usuario que crea esta cuenta
 * @param roles - Array opcional de nombres de rol para asignar
 * @returns Promise que resuelve al usuario creado
 * 
 * @throws {ValidationError} Cuando los datos del usuario son inválidos
 * @throws {ConflictError} Cuando el email del usuario ya existe
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
  // Implementación
}
```

#### Archivos README para Servicios
Cada servicio debe tener un README comprehensivo:

```markdown
# Access Service

## Descripción General
Breve descripción del propósito y capacidades del servicio.

## Arquitectura
- Detalles de implementación CQRS
- Entidades de dominio
- Patrones clave utilizados

## Documentación de API
Enlaces a documentación OpenAPI/GraphQL

## Configuración e Instalación
Instrucciones de configuración de desarrollo

## Testing
Cómo ejecutar tests para este servicio
```

### Documentación de API

#### OpenAPI/Swagger para APIs REST
```typescript
@ApiOperation({
  summary: 'Crear un nuevo usuario',
  description: 'Crea una nueva cuenta de usuario con roles y permisos especificados'
})
@ApiBody({
  type: CreateUserDto,
  description: 'Datos de creación de usuario',
  examples: {
    standard: {
      summary: 'Creación de usuario estándar',
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
  description: 'Usuario creado exitosamente',
  type: UserResponseDto
})
@ApiResponse({
  status: 409,
  description: 'El email ya existe'
})
```

#### Documentación de Schema GraphQL
```graphql
"""
Entidad Usuario que representa un usuario del sistema
"""
type User {
  """Identificador único para el usuario"""
  id: ID!
  
  """Dirección de email del usuario (debe ser única)"""
  email: String!
  
  """Nombre del usuario"""
  firstName: String!
  
  """Apellido del usuario"""
  lastName: String!
  
  """Si la cuenta del usuario está activa"""
  isActive: Boolean!
}
```

## 🔄 Proceso de Pull Request

### Antes de Enviar

1. **Asegurar que tu rama esté actualizada**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout tu-rama-feature
   git rebase develop
   ```

2. **Ejecutar verificaciones de calidad**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

3. **Actualizar documentación**
   - Actualizar archivos README relevantes
   - Agregar/actualizar documentación de API
   - Actualizar docs de arquitectura si es necesario

### Requisitos de PR

#### Formato de Título
```
<tipo>(<scope>): <descripción>

Ejemplos:
feat(access-service): implementar permisos basados en roles
fix(products-service): resolver problema de sincronización de inventario
docs(contributing): agregar pautas de testing
```

#### Template de Descripción de PR
```markdown
## Descripción
Breve descripción de los cambios y motivación.

## Tipo de Cambio
- [ ] Corrección de bug
- [ ] Nueva característica
- [ ] Cambio breaking
- [ ] Actualización de documentación
- [ ] Mejora de performance
- [ ] Refactorización de código

## Testing
- [ ] Tests unitarios agregados/actualizados
- [ ] Tests de integración agregados/actualizados
- [ ] Testing manual completado
- [ ] Todos los tests pasando

## Checklist
- [ ] El código sigue las pautas de estilo del proyecto
- [ ] Auto-revisión completada
- [ ] Documentación actualizada
- [ ] No hay cambios breaking (o están documentados)
- [ ] Listo para revisión

## Screenshots (si aplica)
Agregar screenshots para cambios de UI.

## Issues Relacionados
Closes #123
Fixes #456
```

### Proceso de Revisión

#### Verificaciones Automáticas
- **Pipeline CI/CD**: Debe pasar todos los tests automáticos
- **Calidad de Código**: El análisis de SonarQube debe pasar
- **Seguridad**: No se detectan vulnerabilidades de seguridad
- **Performance**: No hay regresiones significativas de performance

#### Requisitos de Revisión Manual
- **Al menos 2 aprobaciones** para cambios de características
- **Al menos 1 aprobación** para correcciones de bugs y documentación
- **Revisión de arquitectura** para cambios significativos
- **Revisión de seguridad** para cambios de autenticación/autorización

#### Criterios de Revisión
- **Calidad de Código**: Sigue los estándares de codificación
- **Arquitectura**: Se alinea con los patrones del proyecto
- **Testing**: Cobertura de tests adecuada
- **Documentación**: Los cambios están documentados
- **Performance**: No hay regresiones de performance
- **Seguridad**: No hay vulnerabilidades de seguridad

### Requisitos de Merge

- ✅ Todas las verificaciones automáticas pasando
- ✅ Aprobaciones requeridas recibidas
- ✅ Rama actualizada con el target
- ✅ No hay conflictos de merge
- ✅ Documentación actualizada

## 🐛 Pautas para Issues

### Reportes de Bugs

Usar el template de reporte de bugs:

```markdown
## Descripción del Bug
Descripción clara del bug.

## Pasos para Reproducir
1. Ir a '...'
2. Hacer clic en '...'
3. Ver error

## Comportamiento Esperado
Lo que debería suceder.

## Comportamiento Actual
Lo que realmente sucedió.

## Entorno
- OS: [ej., Windows 10]
- Navegador: [ej., Chrome 91]
- Node.js: [ej., 18.0.0]
- Servicio: [ej., access-service]

## Screenshots
Agregar screenshots si aplica.

## Contexto Adicional
Cualquier otra información relevante.
```

### Solicitudes de Características

Usar el template de solicitud de características:

```markdown
## Descripción de la Característica
Descripción clara de la característica solicitada.

## Caso de Negocio
¿Por qué se necesita esta característica?

## Solución Propuesta
¿Cómo debería funcionar esta característica?

## Soluciones Alternativas
Otros enfoques considerados.

## Contexto Adicional
Mockups, ejemplos, o issues relacionados.
```

### Labels de Issues

- **Tipo**: `bug`, `feature`, `enhancement`, `documentation`
- **Prioridad**: `low`, `medium`, `high`, `critical`
- **Estado**: `triage`, `in-progress`, `blocked`, `ready-for-review`
- **Componente**: `access-service`, `products-service`, `frontend`, `infrastructure`

## 🚀 Proceso de Release

### Gestión de Versiones

Seguimos **Semantic Versioning** (SemVer):

- **MAJOR** (1.0.0): Cambios breaking
- **MINOR** (0.1.0): Nuevas características (compatible hacia atrás)
- **PATCH** (0.0.1): Correcciones de bugs (compatible hacia atrás)

### Flujo de Release

1. **Feature Freeze**: No nuevas características en rama de release
2. **Fase de Testing**: Testing comprehensivo del candidato de release
3. **Actualización de Documentación**: Asegurar que toda la documentación esté actualizada
4. **Notas de Release**: Preparación detallada del changelog
5. **Deployment**: Despliegue por etapas a producción

### Formato de Changelog

```markdown
# Changelog

## [1.2.0] - 2025-06-19

### Agregado
- Nuevo sistema de gestión de roles de usuario
- Condiciones avanzadas de permisos
- Dashboard de analytics de seguridad

### Cambiado
- Mejorada performance de queries para datasets grandes
- Actualizados componentes UI a PrimeNG 17

### Corregido
- Memory leak en procesamiento de eventos
- Race condition en autenticación de usuario

### Seguridad
- Mejorada validación de política de contraseñas
- Mejorada gestión de sesiones

### Cambios Breaking
- Removidos endpoints de API deprecados
- Cambiado formato de token de autenticación
```

## 🏆 Reconocimiento

### Reconocimiento de Contribuidores

Reconocemos contribuciones valiosas a través de:

- **Destacados Mensuales de Contribuidores**
- **Premios Anuales de Contribuidores**
- **Reconocimiento en Redes Sociales**
- **Oportunidades de Hablar en Conferencias**

### Tipos de Contribuciones Valoradas

- **Contribuciones de Código**: Características, correcciones de bugs, mejoras de performance
- **Documentación**: Guías, tutoriales, documentación de API
- **Testing**: Mejoras de tests, encontrar bugs, aseguramiento de calidad
- **Diseño**: Mejoras UX/UI, mejoras de accesibilidad
- **Comunidad**: Ayudar a otros contribuidores, triage de issues

## 📞 Obtener Ayuda

### Canales de Comunicación

- **GitHub Issues**: Preguntas técnicas y reportes de bugs
- **GitHub Discussions**: Preguntas generales e ideas
- **Team Slack**: Colaboración en tiempo real (invitación requerida)
- **Email**: maintainers@enterprise-platform.com

### Programa de Mentoría

Los nuevos contribuidores pueden solicitar mentoría para:

- **Entendimiento de Arquitectura**: Aprender el diseño del sistema
- **Configuración de Desarrollo**: Configurar el entorno
- **Primera Contribución**: Guía en el primer pull request
- **Mejores Prácticas**: Aprender las convenciones del proyecto

### Recursos de Documentación

- **Guía de Arquitectura**: [/docs/es/architecture.md](./architecture.md)
- **Guía de Desarrollo**: [/docs/es/development.md](./development.md)
- **Guía de Resolución de Problemas**: [/docs/es/troubleshooting.md](./troubleshooting.md)
- **FAQ**: [/docs/es/faq.md](./faq.md)
- **Documentación de API**: Generada desde anotaciones de código
- **Tutoriales en Video**: Disponibles en el wiki del proyecto

## 📝 Legal

### Acuerdo de Licencia de Contribuidor

Al contribuir a este proyecto, aceptas que:

1. **Posees los derechos** de tu contribución
2. **Nos otorgas derechos** para usar tu contribución
3. **Tu contribución es trabajo original**
4. **Entiendes** que este es un proyecto de código abierto

### Cumplimiento de Licencia

- Todas las contribuciones deben ser compatibles con la Licencia MIT
- Incluir atribución apropiada para código de terceros
- Asegurar que no se incluya código propietario o con derechos de autor

---

## 🙏 Gracias

¡Gracias por tomarte el tiempo de contribuir a la Enterprise Commerce Platform! Tus contribuciones ayudan a hacer este proyecto mejor para todos.

**¡Feliz programación!** 🚀

---

*Esta guía de contribución es un documento vivo y puede ser actualizada para reflejar las necesidades evolutivas del proyecto.*
