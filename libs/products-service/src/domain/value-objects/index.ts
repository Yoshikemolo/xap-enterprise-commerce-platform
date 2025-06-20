// ============================================================================
// PRODUCT CODE VALUE OBJECT
// ============================================================================

export class ProductCode {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value.toUpperCase().trim();
  }

  get value(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Product code cannot be empty');
    }

    const trimmed = value.trim();
    
    if (trimmed.length < 3 || trimmed.length > 50) {
      throw new Error('Product code must be between 3 and 50 characters');
    }

    // Allow alphanumeric characters, hyphens, and underscores
    const codeRegex = /^[A-Za-z0-9_-]+$/;
    if (!codeRegex.test(trimmed)) {
      throw new Error('Product code can only contain letters, numbers, hyphens, and underscores');
    }
  }

  equals(other: ProductCode): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static fromString(value: string): ProductCode {
    return new ProductCode(value);
  }
}

// ============================================================================
// BATCH NUMBER VALUE OBJECT
// ============================================================================

export class BatchNumber {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value.toUpperCase().trim();
  }

  get value(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Batch number cannot be empty');
    }

    const trimmed = value.trim();
    
    if (trimmed.length < 2 || trimmed.length > 30) {
      throw new Error('Batch number must be between 2 and 30 characters');
    }

    // Allow alphanumeric characters, hyphens, underscores, and dots
    const batchRegex = /^[A-Za-z0-9._-]+$/;
    if (!batchRegex.test(trimmed)) {
      throw new Error('Batch number can only contain letters, numbers, dots, hyphens, and underscores');
    }
  }

  equals(other: BatchNumber): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static fromString(value: string): BatchNumber {
    return new BatchNumber(value);
  }

  static generateBatch(prefix?: string): BatchNumber {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const batchValue = prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
    return new BatchNumber(batchValue);
  }
}

// ============================================================================
// QUANTITY VALUE OBJECT
// ============================================================================

export class Quantity {
  private readonly _value: number;
  private readonly _unit: string;

  constructor(value: number, unit: string = 'piece') {
    this.validate(value, unit);
    this._value = value;
    this._unit = unit.toLowerCase();
  }

  get value(): number {
    return this._value;
  }

  get unit(): string {
    return this._unit;
  }

  private validate(value: number, unit: string): void {
    if (value < 0) {
      throw new Error('Quantity cannot be negative');
    }

    if (!Number.isFinite(value)) {
      throw new Error('Quantity must be a finite number');
    }

    if (!unit || unit.trim().length === 0) {
      throw new Error('Unit cannot be empty');
    }

    const validUnits = [
      'piece', 'pcs', 'unit', 'each',
      'kg', 'g', 'ton', 'lb', 'oz',
      'liter', 'l', 'ml', 'gallon', 'qt',
      'meter', 'm', 'cm', 'mm', 'inch', 'ft',
      'box', 'pack', 'case', 'dozen', 'pair'
    ];

    if (!validUnits.includes(unit.toLowerCase())) {
      throw new Error(`Invalid unit: ${unit}. Valid units are: ${validUnits.join(', ')}`);
    }
  }

  add(other: Quantity): Quantity {
    if (this._unit !== other._unit) {
      throw new Error(`Cannot add quantities with different units: ${this._unit} and ${other._unit}`);
    }
    return new Quantity(this._value + other._value, this._unit);
  }

  subtract(other: Quantity): Quantity {
    if (this._unit !== other._unit) {
      throw new Error(`Cannot subtract quantities with different units: ${this._unit} and ${other._unit}`);
    }
    if (this._value < other._value) {
      throw new Error('Cannot subtract larger quantity from smaller quantity');
    }
    return new Quantity(this._value - other._value, this._unit);
  }

  multiply(factor: number): Quantity {
    if (factor < 0) {
      throw new Error('Cannot multiply by negative factor');
    }
    return new Quantity(this._value * factor, this._unit);
  }

  isZero(): boolean {
    return this._value === 0;
  }

  isPositive(): boolean {
    return this._value > 0;
  }

  equals(other: Quantity): boolean {
    return this._value === other._value && this._unit === other._unit;
  }

  isGreaterThan(other: Quantity): boolean {
    if (this._unit !== other._unit) {
      throw new Error(`Cannot compare quantities with different units: ${this._unit} and ${other._unit}`);
    }
    return this._value > other._value;
  }

  isLessThan(other: Quantity): boolean {
    if (this._unit !== other._unit) {
      throw new Error(`Cannot compare quantities with different units: ${this._unit} and ${other._unit}`);
    }
    return this._value < other._value;
  }

  toString(): string {
    return `${this._value} ${this._unit}`;
  }

  static zero(unit: string = 'piece'): Quantity {
    return new Quantity(0, unit);
  }

  static fromNumber(value: number, unit: string = 'piece'): Quantity {
    return new Quantity(value, unit);
  }
}

// ============================================================================
// PRICE VALUE OBJECT
// ============================================================================

export class Price {
  private readonly _amount: number;
  private readonly _currency: string;

  constructor(amount: number, currency: string = 'EUR') {
    this.validate(amount, currency);
    this._amount = Math.round(amount * 100) / 100; // Round to 2 decimal places
    this._currency = currency.toUpperCase();
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  private validate(amount: number, currency: string): void {
    if (amount < 0) {
      throw new Error('Price amount cannot be negative');
    }

    if (!Number.isFinite(amount)) {
      throw new Error('Price amount must be a finite number');
    }

    if (!currency || currency.trim().length === 0) {
      throw new Error('Currency cannot be empty');
    }

    const validCurrencies = ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
    if (!validCurrencies.includes(currency.toUpperCase())) {
      throw new Error(`Invalid currency: ${currency}. Valid currencies are: ${validCurrencies.join(', ')}`);
    }
  }

  add(other: Price): Price {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot add prices with different currencies: ${this._currency} and ${other._currency}`);
    }
    return new Price(this._amount + other._amount, this._currency);
  }

  subtract(other: Price): Price {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot subtract prices with different currencies: ${this._currency} and ${other._currency}`);
    }
    if (this._amount < other._amount) {
      throw new Error('Cannot subtract larger price from smaller price');
    }
    return new Price(this._amount - other._amount, this._currency);
  }

  multiply(factor: number): Price {
    if (factor < 0) {
      throw new Error('Cannot multiply by negative factor');
    }
    return new Price(this._amount * factor, this._currency);
  }

  applyDiscount(percentage: number): Price {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }
    const discountFactor = (100 - percentage) / 100;
    return new Price(this._amount * discountFactor, this._currency);
  }

  applyTax(percentage: number): Price {
    if (percentage < 0) {
      throw new Error('Tax percentage cannot be negative');
    }
    const taxFactor = (100 + percentage) / 100;
    return new Price(this._amount * taxFactor, this._currency);
  }

  isZero(): boolean {
    return this._amount === 0;
  }

  isPositive(): boolean {
    return this._amount > 0;
  }

  equals(other: Price): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  isGreaterThan(other: Price): boolean {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot compare prices with different currencies: ${this._currency} and ${other._currency}`);
    }
    return this._amount > other._amount;
  }

  isLessThan(other: Price): boolean {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot compare prices with different currencies: ${this._currency} and ${other._currency}`);
    }
    return this._amount < other._amount;
  }

  toString(): string {
    return `${this._amount.toFixed(2)} ${this._currency}`;
  }

  toDisplayString(): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this._currency,
    });
    return formatter.format(this._amount);
  }

  static zero(currency: string = 'EUR'): Price {
    return new Price(0, currency);
  }

  static fromNumber(amount: number, currency: string = 'EUR'): Price {
    return new Price(amount, currency);
  }
}

// ============================================================================
// LOCATION VALUE OBJECT
// ============================================================================

export class Location {
  private readonly _warehouse: string;
  private readonly _zone?: string;
  private readonly _aisle?: string;
  private readonly _shelf?: string;
  private readonly _bin?: string;

  constructor(props: {
    warehouse: string;
    zone?: string;
    aisle?: string;
    shelf?: string;
    bin?: string;
  }) {
    this.validate(props);
    this._warehouse = props.warehouse.toUpperCase().trim();
    this._zone = props.zone?.toUpperCase().trim();
    this._aisle = props.aisle?.toUpperCase().trim();
    this._shelf = props.shelf?.toUpperCase().trim();
    this._bin = props.bin?.toUpperCase().trim();
  }

  get warehouse(): string {
    return this._warehouse;
  }

  get zone(): string | undefined {
    return this._zone;
  }

  get aisle(): string | undefined {
    return this._aisle;
  }

  get shelf(): string | undefined {
    return this._shelf;
  }

  get bin(): string | undefined {
    return this._bin;
  }

  private validate(props: {
    warehouse: string;
    zone?: string;
    aisle?: string;
    shelf?: string;
    bin?: string;
  }): void {
    if (!props.warehouse || props.warehouse.trim().length === 0) {
      throw new Error('Warehouse cannot be empty');
    }

    if (props.warehouse.trim().length > 20) {
      throw new Error('Warehouse name cannot exceed 20 characters');
    }

    // Validate optional fields if provided
    if (props.zone && props.zone.trim().length > 10) {
      throw new Error('Zone name cannot exceed 10 characters');
    }

    if (props.aisle && props.aisle.trim().length > 10) {
      throw new Error('Aisle name cannot exceed 10 characters');
    }

    if (props.shelf && props.shelf.trim().length > 10) {
      throw new Error('Shelf name cannot exceed 10 characters');
    }

    if (props.bin && props.bin.trim().length > 10) {
      throw new Error('Bin name cannot exceed 10 characters');
    }
  }

  getFullLocation(): string {
    const parts = [this._warehouse];
    
    if (this._zone) parts.push(this._zone);
    if (this._aisle) parts.push(this._aisle);
    if (this._shelf) parts.push(this._shelf);
    if (this._bin) parts.push(this._bin);

    return parts.join('-');
  }

  equals(other: Location): boolean {
    return (
      this._warehouse === other._warehouse &&
      this._zone === other._zone &&
      this._aisle === other._aisle &&
      this._shelf === other._shelf &&
      this._bin === other._bin
    );
  }

  toString(): string {
    return this.getFullLocation();
  }

  static fromString(locationString: string): Location {
    const parts = locationString.split('-');
    
    if (parts.length === 0) {
      throw new Error('Invalid location string');
    }

    return new Location({
      warehouse: parts[0],
      zone: parts[1],
      aisle: parts[2],
      shelf: parts[3],
      bin: parts[4]
    });
  }

  static warehouse(name: string): Location {
    return new Location({ warehouse: name });
  }
}