import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// FAMILY ENTITY
// ============================================================================

export interface FamilyProps {
  id?: number;
  uuid?: string;
  name: string;
  code: string; // Código único de familia
  description?: string;
  parentFamilyId?: number; // Para jerarquías de familias
  isActive: boolean;
  metadata?: Record<string, any>;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Domain Events for Family
export class FamilyCreatedEvent {
  constructor(
    public readonly familyId: number,
    public readonly name: string,
    public readonly code: string
  ) {}
}

export class FamilyUpdatedEvent {
  constructor(
    public readonly familyId: number,
    public readonly code: string,
    public readonly changes: Partial<FamilyProps>
  ) {}
}

export class FamilyActivatedEvent {
  constructor(
    public readonly familyId: number,
    public readonly code: string
  ) {}
}

export class FamilyDeactivatedEvent {
  constructor(
    public readonly familyId: number,
    public readonly code: string
  ) {}
}

export class Family extends AggregateRoot {
  private _id: number;
  private _uuid: string;
  private _name: string;
  private _code: string;
  private _description?: string;
  private _parentFamilyId?: number;
  private _isActive: boolean;
  private _metadata: Record<string, any>;
  private _sortOrder: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: FamilyProps) {
    super();
    this._id = props.id || 0;
    this._uuid = props.uuid || uuidv4();
    this._name = props.name;
    this._code = props.code;
    this._description = props.description;
    this._parentFamilyId = props.parentFamilyId;
    this._isActive = props.isActive ?? true;
    this._metadata = props.metadata || {};
    this._sortOrder = props.sortOrder || 0;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Factory method
  static create(props: Omit<FamilyProps, 'id' | 'uuid' | 'createdAt' | 'updatedAt'>): Family {
    const family = new Family({
      ...props,
      uuid: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    family.apply(new FamilyCreatedEvent(
      family._id,
      family._name,
      family._code
    ));

    return family;
  }

  // Getters
  get id(): number { return this._id; }
  get uuid(): string { return this._uuid; }
  get name(): string { return this._name; }
  get code(): string { return this._code; }
  get description(): string | undefined { return this._description; }
  get parentFamilyId(): number | undefined { return this._parentFamilyId; }
  get isActive(): boolean { return this._isActive; }
  get metadata(): Record<string, any> { return this._metadata; }
  get sortOrder(): number { return this._sortOrder; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Business Methods
  updateFamily(props: Partial<Pick<FamilyProps, 'name' | 'description' | 'parentFamilyId' | 'metadata' | 'sortOrder'>>): void {
    const changes: Partial<FamilyProps> = {};

    if (props.name && props.name !== this._name) {
      this._name = props.name;
      changes.name = props.name;
    }

    if (props.description !== undefined && props.description !== this._description) {
      this._description = props.description;
      changes.description = props.description;
    }

    if (props.parentFamilyId !== undefined && props.parentFamilyId !== this._parentFamilyId) {
      this._parentFamilyId = props.parentFamilyId;
      changes.parentFamilyId = props.parentFamilyId;
    }

    if (props.sortOrder !== undefined && props.sortOrder !== this._sortOrder) {
      this._sortOrder = props.sortOrder;
      changes.sortOrder = props.sortOrder;
    }

    if (props.metadata) {
      this._metadata = { ...this._metadata, ...props.metadata };
      changes.metadata = this._metadata;
    }

    if (Object.keys(changes).length > 0) {
      this._updatedAt = new Date();
      this.apply(new FamilyUpdatedEvent(this._id, this._code, changes));
    }
  }

  activate(): void {
    if (!this._isActive) {
      this._isActive = true;
      this._updatedAt = new Date();
      this.apply(new FamilyActivatedEvent(this._id, this._code));
    }
  }

  deactivate(): void {
    if (this._isActive) {
      this._isActive = false;
      this._updatedAt = new Date();
      this.apply(new FamilyDeactivatedEvent(this._id, this._code));
    }
  }

  // Validation methods
  validateCode(): boolean {
    return this._code && this._code.length >= 2 && this._code.length <= 20;
  }

  validateName(): boolean {
    return this._name && this._name.length >= 2 && this._name.length <= 100;
  }

  isSubfamily(): boolean {
    return this._parentFamilyId !== undefined && this._parentFamilyId > 0;
  }

  // Serialization
  toSnapshot(): FamilyProps {
    return {
      id: this._id,
      uuid: this._uuid,
      name: this._name,
      code: this._code,
      description: this._description,
      parentFamilyId: this._parentFamilyId,
      isActive: this._isActive,
      metadata: this._metadata,
      sortOrder: this._sortOrder,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }

  static fromSnapshot(props: FamilyProps): Family {
    return new Family(props);
  }
}

// ============================================================================
// PACKAGE ENTITY
// ============================================================================

export interface PackageProps {
  id?: number;
  uuid?: string;
  productId: number;
  name: string;
  code: string; // Código único del package
  description?: string;
  unitOfMeasure: string; // 'piece', 'kg', 'liter', 'box', etc.
  quantity: number; // Cantidad de unidades base por package
  dimensions?: PackageDimensions;
  weight?: number; // Peso del package
  isDefault: boolean; // Si es el package por defecto del producto
  isActive: boolean;
  barcodes?: string[]; // Códigos de barras asociados
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'mm' | 'inch';
}

// Domain Events for Package
export class PackageCreatedEvent {
  constructor(
    public readonly packageId: number,
    public readonly productId: number,
    public readonly name: string,
    public readonly code: string
  ) {}
}

export class PackageUpdatedEvent {
  constructor(
    public readonly packageId: number,
    public readonly code: string,
    public readonly changes: Partial<PackageProps>
  ) {}
}

export class PackageActivatedEvent {
  constructor(
    public readonly packageId: number,
    public readonly code: string
  ) {}
}

export class PackageDeactivatedEvent {
  constructor(
    public readonly packageId: number,
    public readonly code: string
  ) {}
}

export class PackageSetAsDefaultEvent {
  constructor(
    public readonly packageId: number,
    public readonly productId: number,
    public readonly code: string
  ) {}
}

export class Package extends AggregateRoot {
  private _id: number;
  private _uuid: string;
  private _productId: number;
  private _name: string;
  private _code: string;
  private _description?: string;
  private _unitOfMeasure: string;
  private _quantity: number;
  private _dimensions?: PackageDimensions;
  private _weight?: number;
  private _isDefault: boolean;
  private _isActive: boolean;
  private _barcodes: string[];
  private _metadata: Record<string, any>;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PackageProps) {
    super();
    this._id = props.id || 0;
    this._uuid = props.uuid || uuidv4();
    this._productId = props.productId;
    this._name = props.name;
    this._code = props.code;
    this._description = props.description;
    this._unitOfMeasure = props.unitOfMeasure;
    this._quantity = props.quantity;
    this._dimensions = props.dimensions;
    this._weight = props.weight;
    this._isDefault = props.isDefault ?? false;
    this._isActive = props.isActive ?? true;
    this._barcodes = props.barcodes || [];
    this._metadata = props.metadata || {};
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Factory method
  static create(props: Omit<PackageProps, 'id' | 'uuid' | 'createdAt' | 'updatedAt'>): Package {
    const packageEntity = new Package({
      ...props,
      uuid: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    packageEntity.apply(new PackageCreatedEvent(
      packageEntity._id,
      packageEntity._productId,
      packageEntity._name,
      packageEntity._code
    ));

    return packageEntity;
  }

  // Getters
  get id(): number { return this._id; }
  get uuid(): string { return this._uuid; }
  get productId(): number { return this._productId; }
  get name(): string { return this._name; }
  get code(): string { return this._code; }
  get description(): string | undefined { return this._description; }
  get unitOfMeasure(): string { return this._unitOfMeasure; }
  get quantity(): number { return this._quantity; }
  get dimensions(): PackageDimensions | undefined { return this._dimensions; }
  get weight(): number | undefined { return this._weight; }
  get isDefault(): boolean { return this._isDefault; }
  get isActive(): boolean { return this._isActive; }
  get barcodes(): string[] { return this._barcodes; }
  get metadata(): Record<string, any> { return this._metadata; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Business Methods
  updatePackage(props: Partial<Pick<PackageProps, 'name' | 'description' | 'unitOfMeasure' | 'quantity' | 'dimensions' | 'weight' | 'metadata'>>): void {
    const changes: Partial<PackageProps> = {};

    if (props.name && props.name !== this._name) {
      this._name = props.name;
      changes.name = props.name;
    }

    if (props.description !== undefined && props.description !== this._description) {
      this._description = props.description;
      changes.description = props.description;
    }

    if (props.unitOfMeasure && props.unitOfMeasure !== this._unitOfMeasure) {
      this._unitOfMeasure = props.unitOfMeasure;
      changes.unitOfMeasure = props.unitOfMeasure;
    }

    if (props.quantity !== undefined && props.quantity !== this._quantity) {
      this._quantity = props.quantity;
      changes.quantity = props.quantity;
    }

    if (props.dimensions) {
      this._dimensions = props.dimensions;
      changes.dimensions = props.dimensions;
    }

    if (props.weight !== undefined && props.weight !== this._weight) {
      this._weight = props.weight;
      changes.weight = props.weight;
    }

    if (props.metadata) {
      this._metadata = { ...this._metadata, ...props.metadata };
      changes.metadata = this._metadata;
    }

    if (Object.keys(changes).length > 0) {
      this._updatedAt = new Date();
      this.apply(new PackageUpdatedEvent(this._id, this._code, changes));
    }
  }

  activate(): void {
    if (!this._isActive) {
      this._isActive = true;
      this._updatedAt = new Date();
      this.apply(new PackageActivatedEvent(this._id, this._code));
    }
  }

  deactivate(): void {
    if (this._isActive) {
      this._isActive = false;
      this._updatedAt = new Date();
      this.apply(new PackageDeactivatedEvent(this._id, this._code));
    }
  }

  setAsDefault(): void {
    if (!this._isDefault) {
      this._isDefault = true;
      this._updatedAt = new Date();
      this.apply(new PackageSetAsDefaultEvent(this._id, this._productId, this._code));
    }
  }

  unsetAsDefault(): void {
    if (this._isDefault) {
      this._isDefault = false;
      this._updatedAt = new Date();
      this.apply(new PackageUpdatedEvent(this._id, this._code, { isDefault: false }));
    }
  }

  addBarcode(barcode: string): void {
    if (!this._barcodes.includes(barcode)) {
      this._barcodes.push(barcode);
      this._updatedAt = new Date();
      this.apply(new PackageUpdatedEvent(this._id, this._code, { barcodes: this._barcodes }));
    }
  }

  removeBarcode(barcode: string): void {
    const index = this._barcodes.indexOf(barcode);
    if (index > -1) {
      this._barcodes.splice(index, 1);
      this._updatedAt = new Date();
      this.apply(new PackageUpdatedEvent(this._id, this._code, { barcodes: this._barcodes }));
    }
  }

  // Validation methods
  validateCode(): boolean {
    return this._code && this._code.length >= 2 && this._code.length <= 30;
  }

  validateName(): boolean {
    return this._name && this._name.length >= 2 && this._name.length <= 100;
  }

  validateQuantity(): boolean {
    return this._quantity > 0;
  }

  validateUnitOfMeasure(): boolean {
    const validUnits = ['piece', 'kg', 'g', 'liter', 'ml', 'box', 'pack', 'dozen', 'meter', 'cm'];
    return validUnits.includes(this._unitOfMeasure.toLowerCase());
  }

  // Utility methods
  hasBarcode(barcode: string): boolean {
    return this._barcodes.includes(barcode);
  }

  getVolume(): number | undefined {
    if (!this._dimensions) return undefined;
    
    const { length, width, height, unit } = this._dimensions;
    let volume = length * width * height;
    
    // Convert to cubic centimeters as standard
    if (unit === 'mm') {
      volume = volume / 1000;
    } else if (unit === 'inch') {
      volume = volume * 16.387;
    }
    
    return volume;
  }

  getDensity(): number | undefined {
    const volume = this.getVolume();
    if (!volume || !this._weight) return undefined;
    
    return this._weight / volume;
  }

  // Serialization
  toSnapshot(): PackageProps {
    return {
      id: this._id,
      uuid: this._uuid,
      productId: this._productId,
      name: this._name,
      code: this._code,
      description: this._description,
      unitOfMeasure: this._unitOfMeasure,
      quantity: this._quantity,
      dimensions: this._dimensions,
      weight: this._weight,
      isDefault: this._isDefault,
      isActive: this._isActive,
      barcodes: this._barcodes,
      metadata: this._metadata,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }

  static fromSnapshot(props: PackageProps): Package {
    return new Package(props);
  }
}