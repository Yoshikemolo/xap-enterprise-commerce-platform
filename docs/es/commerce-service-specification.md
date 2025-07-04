# Commerce Service - Especificación Técnica

## 📋 Índice de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Visión General de la Arquitectura](#visión-general-de-la-arquitectura)
3. [Modelo de Dominio](#modelo-de-dominio)
4. [Subdominios del Servicio](#subdominios-del-servicio)
5. [Implementación CQRS](#implementación-cqrs)
6. [Patrones de Integración](#patrones-de-integración)
7. [Event Sourcing y Telemetría](#event-sourcing-y-telemetría)
8. [Rendimiento y Escalabilidad](#rendimiento-y-escalabilidad)
9. [Hoja de Ruta de Implementación](#hoja-de-ruta-de-implementación)

## 🎯 Resumen Ejecutivo

El **Commerce Service** representa la lógica de negocio central de la Plataforma XAP Enterprise Commerce, orquestando el viaje completo del cliente desde el descubrimiento de productos hasta el cumplimiento de órdenes. Este servicio se integra perfectamente con el **Access Service** (autenticación/autorización) y el **Products Service** (gestión de inventario) para ofrecer una experiencia de comercio electrónico completa.

### Capacidades Clave de Negocio
- **🛒 Gestión de Órdenes**: Ciclo de vida completo de órdenes con trazabilidad de lotes
- **💡 Recomendaciones Inteligentes**: Motor de recomendaciones multi-fuente
- **🎯 Promociones y Precios**: Precios dinámicos con promociones basadas en reglas
- **📊 Analítica de Clientes**: Historial de compras y análisis de comportamiento
- **🚚 Optimización Logística**: Planificación de rutas y gestión de distribución
- **⭐ Sistema de Reseñas**: Reseñas de productos, calificaciones y Q&A
- **🔍 Trazabilidad Completa**: Integración OpenTelemetry para auditorías completas

### Puntos de Integración Estratégicos
- **Access Service**: Permisos de usuario y control de acceso basado en grupos
- **Products Service**: Inventario en tiempo real y lógica FIFO/FEFO
- **Future AI Service**: Recomendaciones impulsadas por ML e insights

## 🏗️ Visión General de la Arquitectura

### Estructura de Microservicio
```
Commerce Service
├── Subdominio de Órdenes
│   ├── Gestión de Órdenes
│   ├── Carrito de Compras
│   ├── Procesamiento de Pagos
│   └── Cumplimiento de Órdenes
├── Subdominio de Recomendaciones
│   ├── Recomendaciones Basadas en Usuario
│   ├── Reseñas y Calificaciones de Productos
│   ├── Contenido del Fabricante
│   └── Recomendaciones del Sistema
├── Subdominio de Promociones
│   ├── Motor de Descuentos
│   ├── Gestión de Cupones
│   ├── Reglas de Precios
│   └── Gestión de Campañas
└── Subdominio de Logística
    ├── Optimización de Rutas
    ├── Centros de Distribución
    ├── Planificación de Entregas
    └── Gestión de Capacidad
```

### Implementación CQRS + DDD
Siguiendo los patrones establecidos de los servicios Access y Products:
- **Lado de Comandos**: Operaciones de negocio y cambios de estado
- **Lado de Consultas**: Modelos de lectura optimizados para rendimiento
- **Eventos de Dominio**: Comunicación entre servicios y registro de auditoría
- **Event Store**: Historial completo de eventos de negocio

### Alineación del Stack Tecnológico
- **Framework**: NestJS con TypeScript
- **Base de Datos**: MySQL (principal) + Redis (cache/sesiones)
- **ORM**: TypeORM con entidades optimizadas
- **Message Bus**: Redis + BullMQ para procesamiento asíncrono
- **Telemetría**: OpenTelemetry para trazado distribuido
- **API**: Endpoints REST con documentación Swagger

## 🏛️ Modelo de Dominio

### Agregados Principales

#### 1. Agregado Order
```typescript
export class Order extends AggregateRoot {
  private constructor(
    private readonly _id: OrderId,
    private readonly _customerId: CustomerId,
    private readonly _orderNumber: string,
    private _status: OrderStatus,
    private _items: OrderItem[],
    private _totalAmount: Money,
    private _shippingAddress: Address,
    private _paymentMethod: PaymentMethod,
    private _promotions: AppliedPromotion[],
    private _metadata: OrderMetadata
  ) {
    super();
  }

  // Métodos de negocio
  addItem(productId: ProductId, quantity: number, unitPrice: Money): void
  removeItem(orderItemId: OrderItemId): void
  applyPromotion(promotion: Promotion): void
  calculateTotal(): Money
  confirmOrder(): void
  fulfillOrder(fulfillmentData: FulfillmentData): void
  cancelOrder(reason: string): void
}
```

#### 2. Agregado Recommendation
```typescript
export class ProductRecommendation extends AggregateRoot {
  private constructor(
    private readonly _id: RecommendationId,
    private readonly _productId: ProductId,
    private readonly _customerId: CustomerId,
    private readonly _type: RecommendationType,
    private _score: number,
    private _reason: string,
    private _context: RecommendationContext,
    private _reviews: ProductReview[],
    private _ratings: ProductRating[]
  ) {
    super();
  }

  // Métodos de negocio
  addReview(review: ProductReview): void
  updateRating(rating: ProductRating): void
  calculateRecommendationScore(): number
  markAsViewed(customerId: CustomerId): void
  markAsInteracted(interactionType: InteractionType): void
}
```

#### 3. Agregado Promotion
```typescript
export class Promotion extends AggregateRoot {
  private constructor(
    private readonly _id: PromotionId,
    private readonly _name: string,
    private readonly _description: string,
    private readonly _type: PromotionType,
    private _rules: PromotionRule[],
    private _discountAmount: Money,
    private _validFrom: Date,
    private _validTo: Date,
    private _usageLimit: number,
    private _currentUsage: number,
    private _targetCustomers: CustomerSegment[],
    private _targetProducts: ProductId[]
  ) {
    super();
  }

  // Métodos de negocio
  isApplicable(order: Order, customer: Customer): boolean
  calculateDiscount(order: Order): Money
  applyToOrder(order: Order): AppliedPromotion
  incrementUsage(): void
  deactivate(): void
}
```

#### 4. Agregado Route
```typescript
export class DeliveryRoute extends AggregateRoot {
  private constructor(
    private readonly _id: RouteId,
    private readonly _routeNumber: string,
    private readonly _driverId: DriverId,
    private readonly _vehicleId: VehicleId,
    private _deliveries: Delivery[],
    private _optimizedStops: Stop[],
    private _capacity: VehicleCapacity,
    private _currentLoad: Load,
    private _status: RouteStatus
  ) {
    super();
  }

  // Métodos de negocio
  addDelivery(delivery: Delivery): void
  optimizeRoute(): OptimizedRoute
  startRoute(): void
  completeStop(stopId: StopId): void
  completeRoute(): void
  calculateEfficiency(): RouteEfficiency
}
```

### Objetos de Valor

#### Objetos de Valor Principales
```typescript
// Manejo de dinero
export class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: Currency
  ) {}
  
  add(other: Money): Money
  subtract(other: Money): Money
  multiply(factor: number): Money
  isZero(): boolean
  isPositive(): boolean
}

// Manejo de direcciones
export class Address {
  constructor(
    private readonly street: string,
    private readonly city: string,
    private readonly state: string,
    private readonly zipCode: string,
    private readonly country: string,
    private readonly coordinates?: GeoCoordinates
  ) {}
  
  getDeliveryZone(): DeliveryZone
  calculateDistanceTo(other: Address): Distance
}

// Sistema de calificaciones
export class ProductRating {
  constructor(
    private readonly customerId: CustomerId,
    private readonly productId: ProductId,
    private readonly overall: RatingValue,
    private readonly quality: RatingValue,
    private readonly price: RatingValue,
    private readonly utility: RatingValue,
    private readonly delivery: RatingValue
  ) {}
  
  calculateWeightedScore(): number
  isValid(): boolean
}
```

### Entidades

#### Entidades de Soporte
```typescript
// Artículo de Orden
export class OrderItem extends Entity {
  constructor(
    id: OrderItemId,
    private readonly productId: ProductId,
    private readonly productCode: string,
    private readonly quantity: number,
    private readonly unitPrice: Money,
    private readonly batchNumber?: string,
    private readonly customizations?: ProductCustomization[]
  ) {
    super(id);
  }
  
  calculateSubtotal(): Money
  getBatchTraceability(): BatchTraceability
}

// Reseña de Producto
export class ProductReview extends Entity {
  constructor(
    id: ReviewId,
    private readonly customerId: CustomerId,
    private readonly productId: ProductId,
    private readonly title: string,
    private readonly content: string,
    private readonly rating: ProductRating,
    private readonly verified: boolean,
    private readonly helpfulVotes: number,
    private readonly attachments: ReviewAttachment[]
  ) {
    super(id);
  }
  
  markAsHelpful(customerId: CustomerId): void
  flagAsInappropriate(reason: string): void
  isVerifiedPurchase(): boolean
}

// Entrada FAQ
export class ProductFAQ extends Entity {
  constructor(
    id: FAQId,
    private readonly productId: ProductId,
    private readonly question: string,
    private readonly answer: string,
    private readonly answeredBy: UserId,
    private readonly category: FAQCategory,
    private readonly votes: number,
    private readonly verified: boolean
  ) {
    super(id);
  }
  
  upvote(): void
  downvote(): void
  markAsVerified(): void
}

// Parada de Entrega
export class Stop extends Entity {
  constructor(
    id: StopId,
    private readonly orderId: OrderId,
    private readonly address: Address,
    private readonly customerId: CustomerId,
    private readonly estimatedTime: Date,
    private readonly actualTime?: Date,
    private readonly deliveryInstructions?: string,
    private _status: StopStatus = StopStatus.PENDING
  ) {
    super(id);
  }
  
  markAsCompleted(actualTime: Date): void
  markAsFailed(reason: string): void
  updateEstimatedTime(newTime: Date): void
}
```

## 🎯 Subdominios del Servicio

### 1. Subdominio de Órdenes

#### Responsabilidades Principales
- **Gestión de Carrito de Compras**: Carrito persistente con recuperación de sesión
- **Procesamiento de Órdenes**: Gestión completa del ciclo de vida de órdenes
- **Integración de Pagos**: Múltiples métodos de pago y pasarelas
- **Cumplimiento de Órdenes**: Integración con logística e inventario
- **Historial de Clientes**: Seguimiento de compras y capacidades de reorden

#### Comandos Clave (15+ planificados)
```typescript
// Gestión de Carrito
CreateShoppingCartCommand
AddItemToCartCommand
RemoveItemFromCartCommand
UpdateCartItemQuantityCommand
ApplyCouponToCartCommand
ClearCartCommand

// Procesamiento de Órdenes
CreateOrderFromCartCommand
ConfirmOrderCommand
PayOrderCommand
CancelOrderCommand
RefundOrderCommand

// Cumplimiento de Órdenes
AllocateInventoryForOrderCommand
PrepareOrderForShippingCommand
ShipOrderCommand
DeliverOrderCommand
CompleteOrderCommand
```

#### Consultas Clave (12+ planificadas)
```typescript
// Consultas de Carrito
GetShoppingCartByCustomerQuery
GetCartItemsQuery
GetCartSummaryQuery

// Consultas de Órdenes
GetOrderByIdQuery
GetOrdersByCustomerQuery
GetOrderHistoryQuery
GetReorderSuggestionsQuery
SearchOrdersQuery

// Consultas de Analíticas
GetOrderStatisticsQuery
GetCustomerPurchasePatternQuery
GetBestSellingProductsQuery
GetAverageOrderValueQuery
```

### 2. Subdominio de Recomendaciones

#### Responsabilidades Principales
- **Recomendaciones Basadas en Usuario**: Algoritmos de filtrado colaborativo
- **Recomendaciones Basadas en Contenido**: Análisis de similitud de productos
- **Gestión de Reseñas**: Sistema de reseñas y calificaciones de clientes
- **Contenido del Fabricante**: Información oficial de productos y FAQs
- **Analíticas de Recomendaciones**: Seguimiento de rendimiento y optimización

#### Comandos Clave (12+ planificados)
```typescript
// Gestión de Reseñas
CreateProductReviewCommand
UpdateProductReviewCommand
DeleteProductReviewCommand
MarkReviewAsHelpfulCommand
FlagReviewAsInappropriateCommand

// Gestión de Calificaciones
RateProductCommand
UpdateProductRatingCommand

// Motor de Recomendaciones
GenerateRecommendationsCommand
UpdateRecommendationScoreCommand
MarkRecommendationAsViewedCommand
TrackRecommendationInteractionCommand

// Gestión de Contenido
CreateProductFAQCommand
UpdateProductFAQCommand
VerifyFAQAnswerCommand
```

#### Consultas Clave (15+ planificadas)
```typescript
// Consultas de Reseñas
GetProductReviewsQuery
GetReviewByIdQuery
GetCustomerReviewsQuery
GetVerifiedReviewsQuery
SearchReviewsQuery

// Consultas de Recomendaciones
GetRecommendationsForCustomerQuery
GetSimilarProductsQuery
GetFrequentlyBoughtTogetherQuery
GetTrendingProductsQuery
GetPersonalizedRecommendationsQuery

// Consultas de Contenido
GetProductFAQsQuery
GetPopularQuestionsQuery
GetManufacturerInfoQuery

// Consultas de Analíticas
GetRecommendationPerformanceQuery
GetReviewStatisticsQuery
GetRatingDistributionQuery
```

### 3. Subdominio de Promociones

#### Responsabilidades Principales
- **Motor de Descuentos**: Cálculos de descuentos basados en reglas
- **Gestión de Cupones**: Creación, distribución y redención de cupones
- **Gestión de Campañas**: Ciclo de vida de campañas promocionales
- **Segmentación de Clientes**: Promociones dirigidas basadas en grupos de usuarios
- **Analíticas de Promociones**: Seguimiento de rendimiento de campañas y ROI

#### Comandos Clave (10+ planificados)
```typescript
// Gestión de Promociones
CreatePromotionCommand
UpdatePromotionCommand
ActivatePromotionCommand
DeactivatePromotionCommand
DeletePromotionCommand

// Gestión de Cupones
GenerateCouponsCommand
DistributeCouponsCommand
RedeemCouponCommand
InvalidateCouponCommand

// Gestión de Campañas
CreateCampaignCommand
LaunchCampaignCommand
EndCampaignCommand
```

#### Consultas Clave (8+ planificadas)
```typescript
// Consultas de Promociones
GetActivePromotionsQuery
GetPromotionByIdQuery
GetPromotionsForCustomerQuery
GetPromotionsForProductQuery

// Consultas de Analíticas
GetPromotionPerformanceQuery
GetCouponUsageStatisticsQuery
GetCampaignROIQuery
GetCustomerSegmentPromotionsQuery
```

### 4. Subdominio de Logística

#### Responsabilidades Principales
- **Optimización de Rutas**: Planificación de rutas de entrega impulsada por IA
- **Gestión de Distribución**: Asignación de inventario multi-centro
- **Planificación de Capacidad**: Optimización de recursos de vehículos y conductores
- **Seguimiento de Entregas**: Actualizaciones de estado de entrega en tiempo real
- **Analíticas de Rendimiento**: Monitoreo de KPIs logísticos

#### Comandos Clave (8+ planificados)
```typescript
// Gestión de Rutas
CreateDeliveryRouteCommand
OptimizeRouteCommand
AssignDriverToRouteCommand
StartRouteCommand
CompleteRouteCommand

// Gestión de Entregas
ScheduleDeliveryCommand
UpdateDeliveryStatusCommand
CompleteDeliveryCommand
```

#### Consultas Clave (10+ planificadas)
```typescript
// Consultas de Rutas
GetRouteByIdQuery
GetRoutesByDateQuery
GetOptimalRoutesQuery
GetDriverRoutesQuery

// Analíticas Logísticas
GetDeliveryPerformanceQuery
GetRouteEfficiencyQuery
GetCapacityUtilizationQuery
GetDeliveryTimeAnalyticsQuery
GetCustomerSatisfactionQuery
GetLogisticsCostAnalysisQuery
```

## 🔄 Implementación CQRS

### Arquitectura de Command Handlers

#### Command Handlers de Órdenes
```typescript
@CommandHandler(CreateOrderFromCartCommand)
export class CreateOrderFromCartCommandHandler implements ICommandHandler<CreateOrderFromCartCommand> {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: ShoppingCartRepository,
    private readonly productService: ProductServiceClient,
    private readonly accessService: AccessServiceClient,
    private readonly eventBus: EventBus,
    private readonly logger: Logger
  ) {}

  async execute(command: CreateOrderFromCartCommand): Promise<OrderId> {
    // 1. Validar permisos del cliente
    await this.validateCustomerPermissions(command.customerId);
    
    // 2. Recuperar y validar carrito
    const cart = await this.cartRepository.findByCustomerId(command.customerId);
    if (!cart || cart.items.length === 0) {
      throw new DomainError('El carrito está vacío');
    }
    
    // 3. Validar disponibilidad de inventario (FIFO/FEFO)
    await this.validateInventoryAvailability(cart.items);
    
    // 4. Crear agregado de orden
    const order = Order.createFromCart(cart, command.shippingAddress, command.paymentMethod);
    
    // 5. Aplicar promociones disponibles
    const applicablePromotions = await this.findApplicablePromotions(order, command.customerId);
    applicablePromotions.forEach(promotion => order.applyPromotion(promotion));
    
    // 6. Guardar orden
    await this.orderRepository.save(order);
    
    // 7. Publicar eventos de dominio
    await this.eventBus.publishAll(order.getUncommittedEvents());
    
    // 8. Trazado OpenTelemetry
    this.logger.info('Orden creada exitosamente', {
      orderId: order.id.value,
      customerId: command.customerId,
      totalAmount: order.totalAmount.amount,
      itemCount: order.items.length
    });
    
    return order.id;
  }
  
  private async validateCustomerPermissions(customerId: string): Promise<void> {
    const hasPermission = await this.accessService.checkPermission(
      customerId, 
      'PLACE_ORDERS'
    );
    
    if (!hasPermission) {
      throw new AuthorizationError('El cliente no tiene permisos para realizar órdenes');
    }
  }
  
  private async validateInventoryAvailability(items: CartItem[]): Promise<void> {
    for (const item of items) {
      const availability = await this.productService.checkAvailability(
        item.productId,
        item.quantity
      );
      
      if (!availability.isAvailable) {
        throw new DomainError(`Producto ${item.productId} no está disponible en la cantidad solicitada`);
      }
    }
  }
}
```

#### Command Handlers de Recomendaciones
```typescript
@CommandHandler(CreateProductReviewCommand)
export class CreateProductReviewCommandHandler implements ICommandHandler<CreateProductReviewCommand> {
  constructor(
    private readonly reviewRepository: ProductReviewRepository,
    private readonly orderRepository: OrderRepository,
    private readonly accessService: AccessServiceClient,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateProductReviewCommand): Promise<ReviewId> {
    // 1. Validar permisos del cliente
    await this.validateReviewPermissions(command.customerId, command.productId);
    
    // 2. Verificar historial de compras
    const hasPurchased = await this.verifyPurchaseHistory(command.customerId, command.productId);
    
    // 3. Crear reseña
    const review = ProductReview.create(
      command.customerId,
      command.productId,
      command.title,
      command.content,
      command.rating,
      hasPurchased // bandera de compra verificada
    );
    
    // 4. Guardar reseña
    await this.reviewRepository.save(review);
    
    // 5. Publicar eventos
    await this.eventBus.publish(new ProductReviewCreatedEvent(review.id, review.productId, review.rating));
    
    return review.id;
  }
}
```

### Arquitectura de Query Handlers

#### Query Handlers de Órdenes
```typescript
@QueryHandler(GetOrdersByCustomerQuery)
export class GetOrdersByCustomerQueryHandler implements IQueryHandler<GetOrdersByCustomerQuery> {
  constructor(
    private readonly orderReadModel: OrderReadModel,
    private readonly accessService: AccessServiceClient
  ) {}

  async execute(query: GetOrdersByCustomerQuery): Promise<OrderHistoryDto[]> {
    // 1. Validar permisos de acceso
    await this.validateAccessPermissions(query.requesterId, query.customerId);
    
    // 2. Recuperar órdenes con paginación
    const orders = await this.orderReadModel.findByCustomerId(
      query.customerId,
      query.pagination
    );
    
    // 3. Transformar a DTOs
    return orders.map(order => OrderHistoryDto.fromDomain(order));
  }
  
  private async validateAccessPermissions(requesterId: string, customerId: string): Promise<void> {
    // El cliente puede acceder a sus propias órdenes
    if (requesterId === customerId) return;
    
    // O el usuario debe tener permisos de administrador
    const hasAdminAccess = await this.accessService.checkPermission(
      requesterId,
      'VIEW_ALL_ORDERS'
    );
    
    if (!hasAdminAccess) {
      throw new AuthorizationError('Permisos insuficientes para ver órdenes del cliente');
    }
  }
}
```

### Modelos de Lectura

#### Modelos de Lectura Optimizados para Rendimiento
```typescript
export interface OrderReadModel {
  findByCustomerId(customerId: string, pagination: PaginationOptions): Promise<OrderSummaryDto[]>
  findByDateRange(startDate: Date, endDate: Date): Promise<OrderSummaryDto[]>
  getOrderStatistics(customerId: string): Promise<OrderStatisticsDto>
  findReorderSuggestions(customerId: string): Promise<ReorderSuggestionDto[]>
  searchOrders(criteria: OrderSearchCriteria): Promise<OrderSummaryDto[]>
}

export interface RecommendationReadModel {
  findRecommendationsForCustomer(customerId: string, type: RecommendationType): Promise<RecommendationDto[]>
  findSimilarProducts(productId: string, limit: number): Promise<ProductRecommendationDto[]>
  findFrequentlyBoughtTogether(productId: string): Promise<ProductRecommendationDto[]>
  getPersonalizedRecommendations(customerId: string, context: RecommendationContext): Promise<RecommendationDto[]>
}
```

## 🔗 Patrones de Integración

### Integración con Access Service

#### Validación de Permisos
```typescript
export interface AccessServiceClient {
  checkPermission(userId: string, permission: string): Promise<boolean>
  getUserGroups(userId: string): Promise<GroupDto[]>
  getEffectivePermissions(userId: string): Promise<string[]>
  validateGroupAccess(userId: string, groupId: string): Promise<boolean>
}

// Uso en Commerce Service
export class OrderPermissionValidator {
  constructor(private readonly accessService: AccessServiceClient) {}
  
  async validateOrderAccess(userId: string, orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    
    // El cliente puede acceder a sus propias órdenes
    if (order.customerId === userId) return;
    
    // Verificar permisos de administrador
    const hasAdminAccess = await this.accessService.checkPermission(
      userId,
      'VIEW_ALL_ORDERS'
    );
    
    if (!hasAdminAccess) {
      // Verificar acceso basado en grupos (ej: equipo de ventas puede ver órdenes de su región)
      const userGroups = await this.accessService.getUserGroups(userId);
      const hasGroupAccess = await this.validateGroupBasedAccess(userGroups, order);
      
      if (!hasGroupAccess) {
        throw new AuthorizationError('Permisos insuficientes');
      }
    }
  }
}
```

### Integración con Products Service

#### Gestión de Inventario
```typescript
export interface ProductServiceClient {
  checkAvailability(productId: string, quantity: number): Promise<AvailabilityDto>
  reserveStock(productId: string, quantity: number, orderId: string): Promise<ReservationDto>
  releaseReservation(reservationId: string): Promise<void>
  consumeStock(productId: string, quantity: number, orderId: string): Promise<BatchConsumptionDto>
  getProductDetails(productId: string): Promise<ProductDto>
  getBatchTraceability(batchNumber: string): Promise<BatchTraceabilityDto>
}

// Integración FIFO/FEFO
export class InventoryManager {
  constructor(private readonly productService: ProductServiceClient) {}
  
  async allocateInventoryForOrder(order: Order): Promise<AllocationResult> {
    const allocations: OrderItemAllocation[] = [];
    
    for (const item of order.items) {
      // Verificar disponibilidad primero
      const availability = await this.productService.checkAvailability(
        item.productId,
        item.quantity
      );
      
      if (!availability.isAvailable) {
        throw new InsufficientInventoryError(item.productId, item.quantity);
      }
      
      // Reservar stock usando lógica FIFO/FEFO del Products Service
      const reservation = await this.productService.reserveStock(
        item.productId,
        item.quantity,
        order.id.value
      );
      
      allocations.push(new OrderItemAllocation(
        item.id,
        reservation.batchAllocations,
        reservation.reservationId
      ));
    }
    
    return new AllocationResult(allocations);
  }
}
```

### Comunicación Dirigida por Eventos

#### Eventos de Dominio
```typescript
// Eventos de Órdenes
export class OrderCreatedEvent extends DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly totalAmount: number,
    public readonly items: OrderItemDto[],
    public readonly timestamp: Date = new Date()
  ) {
    super('OrderCreated', orderId);
  }
}

export class OrderConfirmedEvent extends DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly confirmedAt: Date
  ) {
    super('OrderConfirmed', orderId);
  }
}

// Eventos de Integración
export class InventoryReservedIntegrationEvent extends IntegrationEvent {
  constructor(
    public readonly orderId: string,
    public readonly reservations: StockReservationDto[]
  ) {
    super('InventoryReserved');
  }
}

export class PaymentProcessedIntegrationEvent extends IntegrationEvent {
  constructor(
    public readonly orderId: string,
    public readonly paymentId: string,
    public readonly amount: number,
    public readonly status: PaymentStatus
  ) {
    super('PaymentProcessed');
  }
}
```

## 📊 Event Sourcing y Telemetría

### Integración OpenTelemetry

#### Trazado Distribuido
```typescript
export class OrderTraceService {
  constructor(private readonly tracer: Tracer) {}
  
  async traceOrderCreation(command: CreateOrderFromCartCommand): Promise<Span> {
    return this.tracer.startSpan('commerce.order.create', {
      attributes: {
        'order.customer_id': command.customerId,
        'order.cart_items': command.cartItems?.length || 0,
        'order.shipping_method': command.shippingMethod,
        'commerce.service': 'commerce-service',
        'commerce.operation': 'create_order'
      }
    });
  }
  
  async traceRecommendationGeneration(customerId: string, type: RecommendationType): Promise<Span> {
    return this.tracer.startSpan('commerce.recommendation.generate', {
      attributes: {
        'recommendation.customer_id': customerId,
        'recommendation.type': type,
        'commerce.service': 'commerce-service',
        'commerce.operation': 'generate_recommendations'
      }
    });
  }
  
  async traceUserJourney(event: UserJourneyEvent): Promise<void> {
    const span = this.tracer.startSpan('commerce.user_journey', {
      attributes: {
        'journey.customer_id': event.customerId,
        'journey.action': event.action,
        'journey.product_id': event.productId,
        'journey.session_id': event.sessionId,
        'journey.timestamp': event.timestamp.toISOString()
      }
    });
    
    span.addEvent('user_action', {
      'action.type': event.action,
      'action.details': JSON.stringify(event.details)
    });
    
    span.end();
  }
}
```

#### Seguimiento del Viaje del Usuario
```typescript
export enum UserJourneyAction {
  PRODUCT_SEARCH = 'product_search',
  PRODUCT_VIEW = 'product_view',
  PRODUCT_COMPARE = 'product_compare',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  VIEW_CART = 'view_cart',
  APPLY_COUPON = 'apply_coupon',
  START_CHECKOUT = 'start_checkout',
  COMPLETE_ORDER = 'complete_order',
  RATE_PRODUCT = 'rate_product',
  REVIEW_PRODUCT = 'review_product'
}

export class UserJourneyEvent extends DomainEvent {
  constructor(
    public readonly customerId: string,
    public readonly sessionId: string,
    public readonly action: UserJourneyAction,
    public readonly productId?: string,
    public readonly details?: Record<string, any>,
    public readonly timestamp: Date = new Date()
  ) {
    super('UserJourneyEvent', customerId);
  }
}

// Event Handler para Seguimiento de Viaje
@EventsHandler(UserJourneyEvent)
export class UserJourneyEventHandler implements IEventHandler<UserJourneyEvent> {
  constructor(
    private readonly traceService: OrderTraceService,
    private readonly analyticsService: AnalyticsService
  ) {}
  
  async handle(event: UserJourneyEvent): Promise<void> {
    // Trazar la acción del usuario
    await this.traceService.traceUserJourney(event);
    
    // Almacenar para analíticas
    await this.analyticsService.recordUserAction(event);
    
    // Activar recomendaciones en tiempo real si aplica
    if (this.shouldTriggerRecommendations(event.action)) {
      await this.analyticsService.updateRecommendations(event.customerId, event);
    }
  }
  
  private shouldTriggerRecommendations(action: UserJourneyAction): boolean {
    return [
      UserJourneyAction.PRODUCT_VIEW,
      UserJourneyAction.ADD_TO_CART,
      UserJourneyAction.COMPLETE_ORDER
    ].includes(action);
  }
}
```

### Implementación del Event Store

#### Commerce Event Store
```typescript
export interface CommerceEventStore {
  append(streamId: string, events: DomainEvent[]): Promise<void>
  getEvents(streamId: string, fromVersion?: number): Promise<DomainEvent[]>
  getEventsByType(eventType: string, fromDate?: Date): Promise<DomainEvent[]>
  getCustomerEventHistory(customerId: string): Promise<DomainEvent[]>
  getProductEventHistory(productId: string): Promise<DomainEvent[]>
}

// Uso para reconstrucción del viaje del cliente
export class CustomerJourneyService {
  constructor(private readonly eventStore: CommerceEventStore) {}
  
  async reconstructCustomerJourney(customerId: string, timeRange?: TimeRange): Promise<CustomerJourneyDto> {
    const events = await this.eventStore.getCustomerEventHistory(customerId);
    
    const filteredEvents = timeRange 
      ? events.filter(e => this.isWithinTimeRange(e.timestamp, timeRange))
      : events;
    
    return this.buildJourneyFromEvents(filteredEvents);
  }
  
  private buildJourneyFromEvents(events: DomainEvent[]): CustomerJourneyDto {
    // Reconstruir viaje completo del cliente para analíticas
    // Esto habilita insights poderosos de BI y personalización
  }
}
```

## ⚡ Rendimiento y Escalabilidad

### Estrategia de Caché

#### Caché Multi-Nivel
```typescript
export class CommerceCacheService {
  constructor(
    private readonly redis: Redis,
    private readonly localCache: NodeCache
  ) {}
  
  // L1: Caché local para datos accedidos frecuentemente
  async getProductRecommendations(customerId: string): Promise<RecommendationDto[] | null> {
    const cacheKey = `recommendations:${customerId}`;
    
    // Verificar caché local primero (L1)
    let recommendations = this.localCache.get<RecommendationDto[]>(cacheKey);
    if (recommendations) return recommendations;
    
    // Verificar caché Redis (L2)
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      recommendations = JSON.parse(cachedData);
      this.localCache.set(cacheKey, recommendations, 300); // TTL 5 min
      return recommendations;
    }
    
    return null;
  }
  
  async setProductRecommendations(customerId: string, recommendations: RecommendationDto[]): Promise<void> {
    const cacheKey = `recommendations:${customerId}`;
    
    // Almacenar en ambos niveles
    this.localCache.set(cacheKey, recommendations, 300); // TTL 5 min
    await this.redis.setex(cacheKey, 1800, JSON.stringify(recommendations)); // TTL 30 min
  }
}
```

### Optimización de Base de Datos

#### Optimización de Modelos de Lectura
```typescript
// Modelos de lectura optimizados para consultas complejas
export interface OrderAnalyticsReadModel {
  getCustomerLifetimeValue(customerId: string): Promise<number>
  getCustomerSegmentation(customerId: string): Promise<CustomerSegmentDto>
  getProductAffinityMatrix(productId: string): Promise<ProductAffinityDto[]>
  getRecommendationPerformance(timeRange: TimeRange): Promise<RecommendationPerformanceDto>
}

// Índices de base de datos para rendimiento
export const CommerceIndexes = {
  orders: [
    'idx_orders_customer_id_created_at',
    'idx_orders_status_created_at',
    'idx_orders_total_amount_status'
  ],
  recommendations: [
    'idx_recommendations_customer_product',
    'idx_recommendations_type_score',
    'idx_recommendations_created_at'
  ],
  reviews: [
    'idx_reviews_product_rating',
    'idx_reviews_customer_verified',
    'idx_reviews_created_at'
  ],
  routes: [
    'idx_routes_date_status',
    'idx_routes_driver_vehicle',
    'idx_routes_efficiency_score'
  ]
};
```

### Procesamiento Asíncrono

#### Procesamiento de Trabajos en Segundo Plano
```typescript
export class CommerceJobProcessor {
  constructor(
    @InjectQueue('recommendations') private readonly recommendationQueue: Queue,
    @InjectQueue('analytics') private readonly analyticsQueue: Queue,
    @InjectQueue('logistics') private readonly logisticsQueue: Queue
  ) {}
  
  // Procesar recomendaciones de forma asíncrona
  async queueRecommendationUpdate(customerId: string, trigger: RecommendationTrigger): Promise<void> {
    await this.recommendationQueue.add('update-recommendations', {
      customerId,
      trigger,
      timestamp: new Date()
    }, {
      delay: 5000, // Retraso de 5 segundos para agrupación
      attempts: 3
    });
  }
  
  // Procesar optimización de rutas en segundo plano
  async queueRouteOptimization(routeId: string, optimizationParams: RouteOptimizationParams): Promise<void> {
    await this.logisticsQueue.add('optimize-route', {
      routeId,
      params: optimizationParams
    }, {
      priority: 1, // Alta prioridad
      attempts: 2
    });
  }
}
```

## 🗺️ Hoja de Ruta de Implementación

### Fase 1: Gestión Central de Órdenes (Semanas 1-4)
**Objetivo**: Establecer funcionalidad básica de e-commerce

#### Semana 1-2: Fundación
- [ ] **Configuración del Módulo Commerce Service**
  - Configuración del módulo NestJS
  - Entidades de base de datos y migraciones
  - Infraestructura CQRS básica
  - Implementaciones de repositorios

- [ ] **Implementación del Agregado Order**
  - Entidad Order con lógica de negocio
  - Funcionalidad del carrito de compras
  - Estados básicos de orden (pendiente, confirmado, enviado, entregado)

#### Semana 3-4: Procesamiento de Órdenes
- [ ] **Implementación de Comandos de Órdenes**
  - CreateOrderFromCartCommand
  - ConfirmOrderCommand
  - CancelOrderCommand
  - UpdateOrderCommand

- [ ] **Integración con Servicios Existentes**
  - Integración con Access Service para permisos
  - Integración con Products Service para inventario
  - Manejo básico de errores y validación

- [ ] **Controladores de API REST**
  - Endpoints de gestión de órdenes
  - Endpoints del carrito de compras
  - Documentación Swagger

#### Entregables de la Fase 1
- ✅ Funcionalidad básica de gestión de órdenes
- ✅ Operaciones del carrito de compras
- ✅ Integración con servicios Access y Products
- ✅ API REST con 10+ endpoints
- ✅ Pruebas unitarias e integración

### Fase 2: Recomendaciones y Reseñas (Semanas 5-8)
**Objetivo**: Implementar motor de recomendaciones y sistema de reseñas

#### Semana 5-6: Sistema de Reseñas
- [ ] **Implementación del Agregado Review**
  - Entidad ProductReview
  - Sistema de calificaciones (calidad, precio, utilidad, entrega)
  - Moderación y verificación de reseñas

- [ ] **Comandos y Consultas de Reseñas**
  - CreateProductReviewCommand
  - UpdateProductRatingCommand
  - Operaciones de gestión de reseñas

#### Semana 7-8: Recomendaciones Básicas
- [ ] **Fundación del Motor de Recomendaciones**
  - Filtrado colaborativo basado en usuario
  - Algoritmos de similitud de productos
  - Lógica de "frecuentemente comprados juntos"

- [ ] **Comandos y Consultas de Recomendaciones**
  - GenerateRecommendationsCommand
  - Seguimiento y analíticas de recomendaciones

#### Entregables de la Fase 2
- ✅ Sistema completo de reseñas y calificaciones
- ✅ Algoritmos básicos de recomendaciones
- ✅ Interfaz de gestión de reseñas
- ✅ Seguimiento de rendimiento de recomendaciones

### Fase 3: Promociones y Funcionalidades Avanzadas (Semanas 9-12)
**Objetivo**: Implementar motor de promociones y funcionalidades avanzadas de comercio

#### Semana 9-10: Motor de Promociones
- [ ] **Implementación del Agregado Promotion**
  - Sistema de promociones basado en reglas
  - Gestión de cupones
  - Segmentación dirigida de clientes

- [ ] **Motor de Cálculo de Descuentos**
  - Descuentos por porcentaje y cantidad fija
  - Promociones "compra X obtén Y"
  - Descuentos basados en cantidad

#### Semana 11-12: Funcionalidades Avanzadas
- [ ] **Analíticas de Clientes**
  - Análisis del historial de compras
  - Cálculo del valor de vida del cliente
  - Segmentación comportamental

- [ ] **Recomendaciones Avanzadas**
  - Preparación para integración de machine learning
  - Framework de pruebas A/B para recomendaciones
  - Optimización de rendimiento

#### Entregables de la Fase 3
- ✅ Sistema completo de promociones
- ✅ Analíticas avanzadas de clientes
- ✅ Motor de recomendaciones optimizado
- ✅ Capacidades de pruebas A/B

### Fase 4: Logística y Optimización de Rutas (Semanas 13-16)
**Objetivo**: Implementar gestión logística y optimización de rutas

#### Semana 13-14: Fundación Logística
- [ ] **Implementación del Agregado Route**
  - Gestión de rutas de entrega
  - Asignación de conductores y vehículos
  - Planificación de capacidad

- [ ] **Servicios Geográficos**
  - Validación y geocodificación de direcciones
  - Cálculos de distancia y tiempo
  - Gestión de zonas de entrega

#### Semana 15-16: Optimización de Rutas
- [ ] **Algoritmos de Optimización**
  - Solucionador del problema de enrutamiento de vehículos (VRP)
  - Optimización multi-objetivo (distancia, capacidad, tiempo)
  - Ajuste dinámico de rutas

- [ ] **Analíticas Logísticas**
  - Métricas de eficiencia de rutas
  - Seguimiento de rendimiento de entregas
  - Reportes de optimización de costos

#### Entregables de la Fase 4
- ✅ Gestión logística completa
- ✅ Algoritmos de optimización de rutas
- ✅ Sistema de seguimiento de entregas
- ✅ Analíticas de rendimiento logístico

### Fases Futuras (Más allá de la Semana 16)

#### Fase 5: Integración IA
- Recomendaciones avanzadas impulsadas por ML
- Analíticas predictivas para inventario
- Optimización de precios dinámicos
- Integración de chatbot para soporte al cliente

#### Fase 6: Analíticas Avanzadas y BI
- Dashboards en tiempo real
- Motor de reportes avanzados
- Integración con data warehouse
- Inteligencia de negocio predictiva

#### Fase 7: Móvil y Omnicanal
- Soporte para aplicaciones móviles
- Capacidades offline-first
- Sincronización de inventario multi-canal
- Funcionalidades de aplicación web progresiva

---

## 🎯 Métricas de Éxito

### KPIs de Negocio
- **Crecimiento de Ingresos**: 25% de aumento en ventas online en el primer año
- **Retención de Clientes**: 40% de mejora en tasa de recompra
- **Tiempo de Procesamiento de Órdenes**: 60% de reducción en tiempo de cumplimiento
- **Satisfacción del Cliente**: 90%+ de calificación de satisfacción
- **Precisión de Recomendaciones**: 75%+ de tasa de click-through en recomendaciones

### KPIs Técnicos
- **Rendimiento de API**: <200ms tiempo de respuesta para 95% de las solicitudes
- **Disponibilidad del Sistema**: 99.9% de tiempo de actividad
- **Capacidad de Procesamiento de Órdenes**: 1000+ órdenes por minuto
- **Generación de Recomendaciones**: <100ms para recomendaciones personalizadas
- **Optimización de Rutas**: 20% de reducción en costos de entrega

### KPIs de Integración
- **Latencia Inter-Servicios**: <50ms para llamadas entre servicios
- **Procesamiento de Eventos**: <5s para propagación de eventos entre servicios
- **Consistencia de Datos**: 99.99% de consistencia eventual en todos los modelos de lectura
- **Tasa de Error**: <0.1% para todos los endpoints de API

---

*Esta especificación sirve como base para implementar el Commerce Service. Todo el desarrollo debe alinearse con estas especificaciones para asegurar consistencia con la arquitectura general de la Plataforma XAP Enterprise Commerce.*

*Versión del Documento: 1.0.0*  
*Creado: 4 de Julio, 2025*  
*Próxima Revisión: 15 de Julio, 2025*