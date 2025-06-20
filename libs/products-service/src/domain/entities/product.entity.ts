import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

export interface ProductProps {
  id?: number;
  uuid?: string;
  productCode: string; // Código único de producto para identificación de negocio
  name: string;
  description?: string;
  familyId?: number;
  isActive: boolean;
  metadata?: Record<string, any>;
  specifications?: ProductSpecification[];
  media?: ProductMedia[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductSpecification {
  key: string;
  value: string;
  unit?: string;
  category?: string;
}

export interface ProductMedia {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  title?: string;
  description?: string;
  isPrimary: boolean;
  sortOrder: number;
}

// Domain Events
export class ProductCreatedEvent {
  constructor(
    public readonly productId: number,
    public readonly productCode: string,
    public readonly name: string,
    public readonly familyId?: number
  ) {}
}

export class ProductUpdatedEvent {
  constructor(
    public readonly productId: number,
    public readonly productCode: string,
    public readonly changes: Partial<ProductProps>
  ) {}
}

export class ProductActivatedEvent {
  constructor(
    public readonly productId: number,
    public readonly productCode: string
  ) {}
}

export class ProductDeactivatedEvent {
  constructor(
    public readonly productId: number,
    public readonly productCode: string
  ) {}
}

export class ProductDeletedEvent {
  constructor(
    public readonly productId: number,
    public readonly productCode: string
  ) {}
}

export class Product extends AggregateRoot {
  private _id: number;
  private _uuid: string;
  private _productCode: string;
  private _name: string;
  private _description?: string;
  private _familyId?: number;
  private _isActive: boolean;
  private _metadata: Record<string, any>;
  private _specifications: ProductSpecification[];
  private _media: ProductMedia[];
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ProductProps) {
    super();
    this._id = props.id || 0;
    this._uuid = props.uuid || uuidv4();
    this._productCode = props.productCode;
    this._name = props.name;
    this._description = props.description;
    this._familyId = props.familyId;
    this._isActive = props.isActive ?? true;
    this._metadata = props.metadata || {};
    this._specifications = props.specifications || [];
    this._media = props.media || [];
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Factory method for creating new products
  static create(props: Omit<ProductProps, 'id' | 'uuid' | 'createdAt' | 'updatedAt'>): Product {
    const product = new Product({
      ...props,
      uuid: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    product.apply(new ProductCreatedEvent(
      product._id,
      product._productCode,
      product._name,
      product._familyId
    ));

    return product;
  }

  // Getters
  get id(): number { return this._id; }
  get uuid(): string { return this._uuid; }
  get productCode(): string { return this._productCode; }
  get name(): string { return this._name; }
  get description(): string | undefined { return this._description; }
  get familyId(): number | undefined { return this._familyId; }
  get isActive(): boolean { return this._isActive; }
  get metadata(): Record<string, any> { return this._metadata; }
  get specifications(): ProductSpecification[] { return this._specifications; }
  get media(): ProductMedia[] { return this._media; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Business Methods
  updateProduct(props: Partial<Pick<ProductProps, 'name' | 'description' | 'familyId' | 'metadata'>>): void {
    const changes: Partial<ProductProps> = {};

    if (props.name && props.name !== this._name) {
      this._name = props.name;
      changes.name = props.name;
    }

    if (props.description !== undefined && props.description !== this._description) {
      this._description = props.description;
      changes.description = props.description;
    }

    if (props.familyId !== undefined && props.familyId !== this._familyId) {
      this._familyId = props.familyId;
      changes.familyId = props.familyId;
    }

    if (props.metadata) {
      this._metadata = { ...this._metadata, ...props.metadata };
      changes.metadata = this._metadata;
    }

    if (Object.keys(changes).length > 0) {
      this._updatedAt = new Date();
      this.apply(new ProductUpdatedEvent(this._id, this._productCode, changes));
    }
  }

  activate(): void {
    if (!this._isActive) {
      this._isActive = true;
      this._updatedAt = new Date();
      this.apply(new ProductActivatedEvent(this._id, this._productCode));
    }
  }

  deactivate(): void {
    if (this._isActive) {
      this._isActive = false;
      this._updatedAt = new Date();
      this.apply(new ProductDeactivatedEvent(this._id, this._productCode));
    }
  }

  addSpecification(specification: ProductSpecification): void {
    const existingIndex = this._specifications.findIndex(spec => spec.key === specification.key);
    
    if (existingIndex >= 0) {
      this._specifications[existingIndex] = specification;
    } else {
      this._specifications.push(specification);
    }

    this._updatedAt = new Date();
    this.apply(new ProductUpdatedEvent(this._id, this._productCode, { specifications: this._specifications }));
  }

  removeSpecification(key: string): void {
    const initialLength = this._specifications.length;
    this._specifications = this._specifications.filter(spec => spec.key !== key);
    
    if (this._specifications.length !== initialLength) {
      this._updatedAt = new Date();
      this.apply(new ProductUpdatedEvent(this._id, this._productCode, { specifications: this._specifications }));
    }
  }

  addMedia(media: ProductMedia): void {
    // If this is set as primary, remove primary flag from others
    if (media.isPrimary) {
      this._media.forEach(m => m.isPrimary = false);
    }

    this._media.push(media);
    this._updatedAt = new Date();
    this.apply(new ProductUpdatedEvent(this._id, this._productCode, { media: this._media }));
  }

  removeMedia(mediaId: string): void {
    const initialLength = this._media.length;
    this._media = this._media.filter(m => m.id !== mediaId);
    
    if (this._media.length !== initialLength) {
      this._updatedAt = new Date();
      this.apply(new ProductUpdatedEvent(this._id, this._productCode, { media: this._media }));
    }
  }

  setPrimaryMedia(mediaId: string): void {
    const media = this._media.find(m => m.id === mediaId);
    if (media) {
      this._media.forEach(m => m.isPrimary = false);
      media.isPrimary = true;
      this._updatedAt = new Date();
      this.apply(new ProductUpdatedEvent(this._id, this._productCode, { media: this._media }));
    }
  }

  // Validation methods
  validateProductCode(): boolean {
    return this._productCode && this._productCode.length >= 3 && this._productCode.length <= 50;
  }

  validateName(): boolean {
    return this._name && this._name.length >= 2 && this._name.length <= 255;
  }

  // Utility methods
  hasSpecification(key: string): boolean {
    return this._specifications.some(spec => spec.key === key);
  }

  getSpecificationValue(key: string): string | undefined {
    const spec = this._specifications.find(spec => spec.key === key);
    return spec?.value;
  }

  getPrimaryMedia(): ProductMedia | undefined {
    return this._media.find(m => m.isPrimary);
  }

  getMediaByType(type: ProductMedia['type']): ProductMedia[] {
    return this._media.filter(m => m.type === type);
  }

  // Serialization
  toSnapshot(): ProductProps {
    return {
      id: this._id,
      uuid: this._uuid,
      productCode: this._productCode,
      name: this._name,
      description: this._description,
      familyId: this._familyId,
      isActive: this._isActive,
      metadata: this._metadata,
      specifications: this._specifications,
      media: this._media,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }

  static fromSnapshot(props: ProductProps): Product {
    return new Product(props);
  }
}