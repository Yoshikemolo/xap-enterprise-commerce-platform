# Commerce Service - Technical Specification

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Domain Model](#domain-model)
4. [Service Subdomains](#service-subdomains)
5. [CQRS Implementation](#cqrs-implementation)
6. [Integration Patterns](#integration-patterns)
7. [Event Sourcing & Telemetry](#event-sourcing--telemetry)
8. [Performance & Scalability](#performance--scalability)
9. [Implementation Roadmap](#implementation-roadmap)

## 🎯 Executive Summary

The **Commerce Service** represents the core business logic of the XAP Enterprise Commerce Platform, orchestrating the complete customer journey from product discovery to order fulfillment. This service integrates seamlessly with the **Access Service** (authentication/authorization) and **Products Service** (inventory management) to deliver a comprehensive e-commerce experience.

### Key Business Capabilities
- **🛒 Order Management**: Complete order lifecycle with batch traceability
- **💡 Smart Recommendations**: Multi-source recommendation engine
- **🎯 Promotions & Pricing**: Dynamic pricing with rule-based promotions
- **📊 Customer Analytics**: Purchase history and behavior analysis
- **🚚 Logistics Optimization**: Route planning and distribution management
- **⭐ Review System**: Product reviews, ratings, and Q&A
- **🔍 Full Traceability**: OpenTelemetry integration for complete audit trails

### Strategic Integration Points
- **Access Service**: User permissions and group-based access control
- **Products Service**: Real-time inventory and FIFO/FEFO logic
- **Future AI Service**: ML-powered recommendations and insights

## 🏗️ Architecture Overview

### Microservice Structure
```
Commerce Service
├── Orders Subdomain
│   ├── Order Management
│   ├── Shopping Cart
│   ├── Payment Processing
│   └── Order Fulfillment
├── Recommendations Subdomain
│   ├── User-based Recommendations
│   ├── Product Reviews & Ratings
│   ├── Manufacturer Content
│   └── System Recommendations
├── Promotions Subdomain
│   ├── Discount Engine
│   ├── Coupon Management
│   ├── Pricing Rules
│   └── Campaign Management
└── Logistics Subdomain
    ├── Route Optimization
    ├── Distribution Centers
    ├── Delivery Planning
    └── Capacity Management
```

### CQRS + DDD Implementation
Following the established patterns from Access and Products services:
- **Command Side**: Business operations and state changes
- **Query Side**: Optimized read models for performance
- **Domain Events**: Inter-service communication and audit trail
- **Event Store**: Complete business event history

### Technology Stack Alignment
- **Framework**: NestJS with TypeScript
- **Database**: MySQL (primary) + Redis (cache/sessions)
- **ORM**: TypeORM with optimized entities
- **Message Bus**: Redis + BullMQ for async processing
- **Telemetry**: OpenTelemetry for distributed tracing
- **API**: REST endpoints with Swagger documentation

## 🏛️ Domain Model

### Core Aggregates

#### 1. Order Aggregate
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

  // Business methods
  addItem(productId: ProductId, quantity: number, unitPrice: Money): void
  removeItem(orderItemId: OrderItemId): void
  applyPromotion(promotion: Promotion): void
  calculateTotal(): Money
  confirmOrder(): void
  fulfillOrder(fulfillmentData: FulfillmentData): void
  cancelOrder(reason: string): void
}
```

#### 2. Recommendation Aggregate
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

  // Business methods
  addReview(review: ProductReview): void
  updateRating(rating: ProductRating): void
  calculateRecommendationScore(): number
  markAsViewed(customerId: CustomerId): void
  markAsInteracted(interactionType: InteractionType): void
}
```

#### 3. Promotion Aggregate
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

  // Business methods
  isApplicable(order: Order, customer: Customer): boolean
  calculateDiscount(order: Order): Money
  applyToOrder(order: Order): AppliedPromotion
  incrementUsage(): void
  deactivate(): void
}
```

#### 4. Route Aggregate
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

  // Business methods
  addDelivery(delivery: Delivery): void
  optimizeRoute(): OptimizedRoute
  startRoute(): void
  completeStop(stopId: StopId): void
  completeRoute(): void
  calculateEfficiency(): RouteEfficiency
}
```

### Value Objects

#### Core Value Objects
```typescript
// Money handling
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

// Address handling
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

// Rating system
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

### Entities

#### Supporting Entities
```typescript
// Order Item
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

// Product Review
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

// FAQ Entry
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

// Delivery Stop
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

## 🎯 Service Subdomains

### 1. Orders Subdomain

#### Core Responsibilities
- **Shopping Cart Management**: Persistent cart with session recovery
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: Multiple payment methods and gateways
- **Order Fulfillment**: Integration with logistics and inventory
- **Customer History**: Purchase tracking and reorder capabilities

#### Key Commands (15+ planned)
```typescript
// Cart Management
CreateShoppingCartCommand
AddItemToCartCommand
RemoveItemFromCartCommand
UpdateCartItemQuantityCommand
ApplyCouponToCartCommand
ClearCartCommand

// Order Processing
CreateOrderFromCartCommand
ConfirmOrderCommand
PayOrderCommand
CancelOrderCommand
RefundOrderCommand

// Order Fulfillment
AllocateInventoryForOrderCommand
PrepareOrderForShippingCommand
ShipOrderCommand
DeliverOrderCommand
CompleteOrderCommand
```

#### Key Queries (12+ planned)
```typescript
// Cart Queries
GetShoppingCartByCustomerQuery
GetCartItemsQuery
GetCartSummaryQuery

// Order Queries
GetOrderByIdQuery
GetOrdersByCustomerQuery
GetOrderHistoryQuery
GetReorderSuggestionsQuery
SearchOrdersQuery

// Analytics Queries
GetOrderStatisticsQuery
GetCustomerPurchasePatternQuery
GetBestSellingProductsQuery
GetAverageOrderValueQuery
```

### 2. Recommendations Subdomain

#### Core Responsibilities
- **User-Based Recommendations**: Collaborative filtering algorithms
- **Content-Based Recommendations**: Product similarity analysis
- **Review Management**: Customer reviews and ratings system
- **Manufacturer Content**: Official product information and FAQs
- **Recommendation Analytics**: Performance tracking and optimization

#### Key Commands (12+ planned)
```typescript
// Review Management
CreateProductReviewCommand
UpdateProductReviewCommand
DeleteProductReviewCommand
MarkReviewAsHelpfulCommand
FlagReviewAsInappropriateCommand

// Rating Management
RateProductCommand
UpdateProductRatingCommand

// Recommendation Engine
GenerateRecommendationsCommand
UpdateRecommendationScoreCommand
MarkRecommendationAsViewedCommand
TrackRecommendationInteractionCommand

// Content Management
CreateProductFAQCommand
UpdateProductFAQCommand
VerifyFAQAnswerCommand
```

#### Key Queries (15+ planned)
```typescript
// Review Queries
GetProductReviewsQuery
GetReviewByIdQuery
GetCustomerReviewsQuery
GetVerifiedReviewsQuery
SearchReviewsQuery

// Recommendation Queries
GetRecommendationsForCustomerQuery
GetSimilarProductsQuery
GetFrequentlyBoughtTogetherQuery
GetTrendingProductsQuery
GetPersonalizedRecommendationsQuery

// Content Queries
GetProductFAQsQuery
GetPopularQuestionsQuery
GetManufacturerInfoQuery

// Analytics Queries
GetRecommendationPerformanceQuery
GetReviewStatisticsQuery
GetRatingDistributionQuery
```

### 3. Promotions Subdomain

#### Core Responsibilities
- **Discount Engine**: Rule-based discount calculations
- **Coupon Management**: Coupon creation, distribution, and redemption
- **Campaign Management**: Promotional campaign lifecycle
- **Customer Segmentation**: Targeted promotions based on user groups
- **Promotion Analytics**: Campaign performance and ROI tracking

#### Key Commands (10+ planned)
```typescript
// Promotion Management
CreatePromotionCommand
UpdatePromotionCommand
ActivatePromotionCommand
DeactivatePromotionCommand
DeletePromotionCommand

// Coupon Management
GenerateCouponsCommand
DistributeCouponsCommand
RedeemCouponCommand
InvalidateCouponCommand

// Campaign Management
CreateCampaignCommand
LaunchCampaignCommand
EndCampaignCommand
```

#### Key Queries (8+ planned)
```typescript
// Promotion Queries
GetActivePromotionsQuery
GetPromotionByIdQuery
GetPromotionsForCustomerQuery
GetPromotionsForProductQuery

// Analytics Queries
GetPromotionPerformanceQuery
GetCouponUsageStatisticsQuery
GetCampaignROIQuery
GetCustomerSegmentPromotionsQuery
```

### 4. Logistics Subdomain

#### Core Responsibilities
- **Route Optimization**: AI-powered delivery route planning
- **Distribution Management**: Multi-center inventory allocation
- **Capacity Planning**: Vehicle and driver resource optimization
- **Delivery Tracking**: Real-time delivery status updates
- **Performance Analytics**: Logistics KPI monitoring

#### Key Commands (8+ planned)
```typescript
// Route Management
CreateDeliveryRouteCommand
OptimizeRouteCommand
AssignDriverToRouteCommand
StartRouteCommand
CompleteRouteCommand

// Delivery Management
ScheduleDeliveryCommand
UpdateDeliveryStatusCommand
CompleteDeliveryCommand
```

#### Key Queries (10+ planned)
```typescript
// Route Queries
GetRouteByIdQuery
GetRoutesByDateQuery
GetOptimalRoutesQuery
GetDriverRoutesQuery

// Logistics Analytics
GetDeliveryPerformanceQuery
GetRouteEfficiencyQuery
GetCapacityUtilizationQuery
GetDeliveryTimeAnalyticsQuery
GetCustomerSatisfactionQuery
GetLogisticsCostAnalysisQuery
```

## 🔄 CQRS Implementation

### Command Handlers Architecture

#### Order Command Handlers
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
    // 1. Validate customer permissions
    await this.validateCustomerPermissions(command.customerId);
    
    // 2. Retrieve and validate cart
    const cart = await this.cartRepository.findByCustomerId(command.customerId);
    if (!cart || cart.items.length === 0) {
      throw new DomainError('Cart is empty');
    }
    
    // 3. Validate inventory availability (FIFO/FEFO)
    await this.validateInventoryAvailability(cart.items);
    
    // 4. Create order aggregate
    const order = Order.createFromCart(cart, command.shippingAddress, command.paymentMethod);
    
    // 5. Apply available promotions
    const applicablePromotions = await this.findApplicablePromotions(order, command.customerId);
    applicablePromotions.forEach(promotion => order.applyPromotion(promotion));
    
    // 6. Save order
    await this.orderRepository.save(order);
    
    // 7. Publish domain events
    await this.eventBus.publishAll(order.getUncommittedEvents());
    
    // 8. OpenTelemetry tracing
    this.logger.info('Order created successfully', {
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
      throw new AuthorizationError('Customer does not have permission to place orders');
    }
  }
  
  private async validateInventoryAvailability(items: CartItem[]): Promise<void> {
    for (const item of items) {
      const availability = await this.productService.checkAvailability(
        item.productId,
        item.quantity
      );
      
      if (!availability.isAvailable) {
        throw new DomainError(`Product ${item.productId} is not available in requested quantity`);
      }
    }
  }
}
```

#### Recommendation Command Handlers
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
    // 1. Validate customer permissions
    await this.validateReviewPermissions(command.customerId, command.productId);
    
    // 2. Verify purchase history
    const hasPurchased = await this.verifyPurchaseHistory(command.customerId, command.productId);
    
    // 3. Create review
    const review = ProductReview.create(
      command.customerId,
      command.productId,
      command.title,
      command.content,
      command.rating,
      hasPurchased // verified purchase flag
    );
    
    // 4. Save review
    await this.reviewRepository.save(review);
    
    // 5. Publish events
    await this.eventBus.publish(new ProductReviewCreatedEvent(review.id, review.productId, review.rating));
    
    return review.id;
  }
}
```

### Query Handlers Architecture

#### Order Query Handlers
```typescript
@QueryHandler(GetOrdersByCustomerQuery)
export class GetOrdersByCustomerQueryHandler implements IQueryHandler<GetOrdersByCustomerQuery> {
  constructor(
    private readonly orderReadModel: OrderReadModel,
    private readonly accessService: AccessServiceClient
  ) {}

  async execute(query: GetOrdersByCustomerQuery): Promise<OrderHistoryDto[]> {
    // 1. Validate access permissions
    await this.validateAccessPermissions(query.requesterId, query.customerId);
    
    // 2. Retrieve orders with pagination
    const orders = await this.orderReadModel.findByCustomerId(
      query.customerId,
      query.pagination
    );
    
    // 3. Transform to DTOs
    return orders.map(order => OrderHistoryDto.fromDomain(order));
  }
  
  private async validateAccessPermissions(requesterId: string, customerId: string): Promise<void> {
    // Customer can access their own orders
    if (requesterId === customerId) return;
    
    // Or user must have admin permissions
    const hasAdminAccess = await this.accessService.checkPermission(
      requesterId,
      'VIEW_ALL_ORDERS'
    );
    
    if (!hasAdminAccess) {
      throw new AuthorizationError('Insufficient permissions to view customer orders');
    }
  }
}
```

### Read Models

#### Optimized Read Models for Performance
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

## 🔗 Integration Patterns

### Access Service Integration

#### Permission Validation
```typescript
export interface AccessServiceClient {
  checkPermission(userId: string, permission: string): Promise<boolean>
  getUserGroups(userId: string): Promise<GroupDto[]>
  getEffectivePermissions(userId: string): Promise<string[]>
  validateGroupAccess(userId: string, groupId: string): Promise<boolean>
}

// Usage in Commerce Service
export class OrderPermissionValidator {
  constructor(private readonly accessService: AccessServiceClient) {}
  
  async validateOrderAccess(userId: string, orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    
    // Customer can access their own orders
    if (order.customerId === userId) return;
    
    // Check admin permissions
    const hasAdminAccess = await this.accessService.checkPermission(
      userId,
      'VIEW_ALL_ORDERS'
    );
    
    if (!hasAdminAccess) {
      // Check group-based access (e.g., sales team can view their region's orders)
      const userGroups = await this.accessService.getUserGroups(userId);
      const hasGroupAccess = await this.validateGroupBasedAccess(userGroups, order);
      
      if (!hasGroupAccess) {
        throw new AuthorizationError('Insufficient permissions');
      }
    }
  }
}
```

### Products Service Integration

#### Inventory Management
```typescript
export interface ProductServiceClient {
  checkAvailability(productId: string, quantity: number): Promise<AvailabilityDto>
  reserveStock(productId: string, quantity: number, orderId: string): Promise<ReservationDto>
  releaseReservation(reservationId: string): Promise<void>
  consumeStock(productId: string, quantity: number, orderId: string): Promise<BatchConsumptionDto>
  getProductDetails(productId: string): Promise<ProductDto>
  getBatchTraceability(batchNumber: string): Promise<BatchTraceabilityDto>
}

// FIFO/FEFO Integration
export class InventoryManager {
  constructor(private readonly productService: ProductServiceClient) {}
  
  async allocateInventoryForOrder(order: Order): Promise<AllocationResult> {
    const allocations: OrderItemAllocation[] = [];
    
    for (const item of order.items) {
      // Check availability first
      const availability = await this.productService.checkAvailability(
        item.productId,
        item.quantity
      );
      
      if (!availability.isAvailable) {
        throw new InsufficientInventoryError(item.productId, item.quantity);
      }
      
      // Reserve stock using FIFO/FEFO logic from Products Service
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

### Event-Driven Communication

#### Domain Events
```typescript
// Order Events
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

// Integration Events
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

## 📊 Event Sourcing & Telemetry

### OpenTelemetry Integration

#### Distributed Tracing
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

#### User Journey Tracking
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

// Event Handler for Journey Tracking
@EventsHandler(UserJourneyEvent)
export class UserJourneyEventHandler implements IEventHandler<UserJourneyEvent> {
  constructor(
    private readonly traceService: OrderTraceService,
    private readonly analyticsService: AnalyticsService
  ) {}
  
  async handle(event: UserJourneyEvent): Promise<void> {
    // Trace the user action
    await this.traceService.traceUserJourney(event);
    
    // Store for analytics
    await this.analyticsService.recordUserAction(event);
    
    // Trigger real-time recommendations if applicable
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

### Event Store Implementation

#### Commerce Event Store
```typescript
export interface CommerceEventStore {
  append(streamId: string, events: DomainEvent[]): Promise<void>
  getEvents(streamId: string, fromVersion?: number): Promise<DomainEvent[]>
  getEventsByType(eventType: string, fromDate?: Date): Promise<DomainEvent[]>
  getCustomerEventHistory(customerId: string): Promise<DomainEvent[]>
  getProductEventHistory(productId: string): Promise<DomainEvent[]>
}

// Usage for customer journey reconstruction
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
    // Reconstruct complete customer journey for analytics
    // This enables powerful BI insights and personalization
  }
}
```

## ⚡ Performance & Scalability

### Caching Strategy

#### Multi-Level Caching
```typescript
export class CommerceCacheService {
  constructor(
    private readonly redis: Redis,
    private readonly localCache: NodeCache
  ) {}
  
  // L1: Local cache for frequently accessed data
  async getProductRecommendations(customerId: string): Promise<RecommendationDto[] | null> {
    const cacheKey = `recommendations:${customerId}`;
    
    // Check local cache first (L1)
    let recommendations = this.localCache.get<RecommendationDto[]>(cacheKey);
    if (recommendations) return recommendations;
    
    // Check Redis cache (L2)
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      recommendations = JSON.parse(cachedData);
      this.localCache.set(cacheKey, recommendations, 300); // 5 min TTL
      return recommendations;
    }
    
    return null;
  }
  
  async setProductRecommendations(customerId: string, recommendations: RecommendationDto[]): Promise<void> {
    const cacheKey = `recommendations:${customerId}`;
    
    // Store in both levels
    this.localCache.set(cacheKey, recommendations, 300); // 5 min TTL
    await this.redis.setex(cacheKey, 1800, JSON.stringify(recommendations)); // 30 min TTL
  }
}
```

### Database Optimization

#### Read Model Optimization
```typescript
// Optimized read models for complex queries
export interface OrderAnalyticsReadModel {
  getCustomerLifetimeValue(customerId: string): Promise<number>
  getCustomerSegmentation(customerId: string): Promise<CustomerSegmentDto>
  getProductAffinityMatrix(productId: string): Promise<ProductAffinityDto[]>
  getRecommendationPerformance(timeRange: TimeRange): Promise<RecommendationPerformanceDto>
}

// Database indexes for performance
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

### Async Processing

#### Background Job Processing
```typescript
export class CommerceJobProcessor {
  constructor(
    @InjectQueue('recommendations') private readonly recommendationQueue: Queue,
    @InjectQueue('analytics') private readonly analyticsQueue: Queue,
    @InjectQueue('logistics') private readonly logisticsQueue: Queue
  ) {}
  
  // Process recommendations asynchronously
  async queueRecommendationUpdate(customerId: string, trigger: RecommendationTrigger): Promise<void> {
    await this.recommendationQueue.add('update-recommendations', {
      customerId,
      trigger,
      timestamp: new Date()
    }, {
      delay: 5000, // 5 second delay for batching
      attempts: 3
    });
  }
  
  // Process route optimization in background
  async queueRouteOptimization(routeId: string, optimizationParams: RouteOptimizationParams): Promise<void> {
    await this.logisticsQueue.add('optimize-route', {
      routeId,
      params: optimizationParams
    }, {
      priority: 1, // High priority
      attempts: 2
    });
  }
}
```

## 🗺️ Implementation Roadmap

### Phase 1: Core Order Management (Weeks 1-4)
**Objective**: Establish basic e-commerce functionality

#### Week 1-2: Foundation
- [ ] **Commerce Service Module Setup**
  - NestJS module configuration
  - Database entities and migrations
  - Basic CQRS infrastructure
  - Repository implementations

- [ ] **Order Aggregate Implementation**
  - Order entity with business logic
  - Shopping cart functionality
  - Basic order states (pending, confirmed, shipped, delivered)

#### Week 3-4: Order Processing
- [ ] **Order Commands Implementation**
  - CreateOrderFromCartCommand
  - ConfirmOrderCommand
  - CancelOrderCommand
  - UpdateOrderCommand

- [ ] **Integration with Existing Services**
  - Access Service integration for permissions
  - Products Service integration for inventory
  - Basic error handling and validation

- [ ] **REST API Controllers**
  - Order management endpoints
  - Shopping cart endpoints
  - Swagger documentation

#### Phase 1 Deliverables
- ✅ Basic order management functionality
- ✅ Shopping cart operations
- ✅ Integration with Access and Products services
- ✅ REST API with 10+ endpoints
- ✅ Unit and integration tests

### Phase 2: Recommendations & Reviews (Weeks 5-8)
**Objective**: Implement recommendation engine and review system

#### Week 5-6: Review System
- [ ] **Review Aggregate Implementation**
  - ProductReview entity
  - Rating system (quality, price, utility, delivery)
  - Review moderation and verification

- [ ] **Review Commands & Queries**
  - CreateProductReviewCommand
  - UpdateProductRatingCommand
  - Review management operations

#### Week 7-8: Basic Recommendations
- [ ] **Recommendation Engine Foundation**
  - User-based collaborative filtering
  - Product similarity algorithms
  - Frequently bought together logic

- [ ] **Recommendation Commands & Queries**
  - GenerateRecommendationsCommand
  - Recommendation tracking and analytics

#### Phase 2 Deliverables
- ✅ Complete review and rating system
- ✅ Basic recommendation algorithms
- ✅ Review management interface
- ✅ Recommendation performance tracking

### Phase 3: Promotions & Advanced Features (Weeks 9-12)
**Objective**: Implement promotions engine and advanced commerce features

#### Week 9-10: Promotions Engine
- [ ] **Promotion Aggregate Implementation**
  - Rule-based promotion system
  - Coupon management
  - Customer segmentation targeting

- [ ] **Discount Calculation Engine**
  - Percentage and fixed amount discounts
  - Buy X get Y promotions
  - Quantity-based discounts

#### Week 11-12: Advanced Features
- [ ] **Customer Analytics**
  - Purchase history analysis
  - Customer lifetime value calculation
  - Behavioral segmentation

- [ ] **Advanced Recommendations**
  - Machine learning integration preparation
  - A/B testing framework for recommendations
  - Performance optimization

#### Phase 3 Deliverables
- ✅ Complete promotions system
- ✅ Advanced customer analytics
- ✅ Optimized recommendation engine
- ✅ A/B testing capabilities

### Phase 4: Logistics & Route Optimization (Weeks 13-16)
**Objective**: Implement logistics management and route optimization

#### Week 13-14: Logistics Foundation
- [ ] **Route Aggregate Implementation**
  - Delivery route management
  - Driver and vehicle assignment
  - Capacity planning

- [ ] **Geographic Services**
  - Address validation and geocoding
  - Distance and time calculations
  - Delivery zone management

#### Week 15-16: Route Optimization
- [ ] **Optimization Algorithms**
  - Vehicle routing problem (VRP) solver
  - Multi-objective optimization (distance, capacity, time)
  - Dynamic route adjustment

- [ ] **Logistics Analytics**
  - Route efficiency metrics
  - Delivery performance tracking
  - Cost optimization reporting

#### Phase 4 Deliverables
- ✅ Complete logistics management
- ✅ Route optimization algorithms
- ✅ Delivery tracking system
- ✅ Logistics performance analytics

### Future Phases (Beyond Week 16)

#### Phase 5: AI Integration
- Advanced ML-powered recommendations
- Predictive analytics for inventory
- Dynamic pricing optimization
- Chatbot integration for customer support

#### Phase 6: Advanced Analytics & BI
- Real-time dashboards
- Advanced reporting engine
- Data warehouse integration
- Predictive business intelligence

#### Phase 7: Mobile & Omnichannel
- Mobile application support
- Offline-first capabilities
- Multi-channel inventory synchronization
- Progressive web app features

---

## 🎯 Success Metrics

### Business KPIs
- **Revenue Growth**: 25% increase in online sales within first year
- **Customer Retention**: 40% improvement in repeat purchase rate
- **Order Processing Time**: 60% reduction in fulfillment time
- **Customer Satisfaction**: 90%+ satisfaction rating
- **Recommendation Accuracy**: 75%+ click-through rate on recommendations

### Technical KPIs
- **API Performance**: <200ms response time for 95% of requests
- **System Availability**: 99.9% uptime
- **Order Processing Capacity**: 1000+ orders per minute
- **Recommendation Generation**: <100ms for personalized recommendations
- **Route Optimization**: 20% reduction in delivery costs

### Integration KPIs
- **Cross-Service Latency**: <50ms for inter-service calls
- **Event Processing**: <5s for event propagation across services
- **Data Consistency**: 99.99% eventual consistency across all read models
- **Error Rate**: <0.1% for all API endpoints

---

*This specification serves as the foundation for implementing the Commerce Service. All development should align with these specifications to ensure consistency with the overall XAP Enterprise Commerce Platform architecture.*

*Document Version: 1.0.0*  
*Created: July 4, 2025*  
*Next Review: July 15, 2025*
