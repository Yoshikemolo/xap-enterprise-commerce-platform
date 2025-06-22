import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany, ManyToOne, JoinColumn, Tree, TreeParent, TreeChildren } from 'typeorm';

/**
 * Family Entity - TypeORM Implementation
 * 
 * Hierarchical product family organization with support for subfamilies
 * and complete tree structure management.
 */
@Entity('families')
@Tree('closure-table')
@Index(['code'], { unique: true })
@Index(['parentFamilyId'])
@Index(['isActive'])
@Index(['sortOrder'])
export class FamilyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'parent_family_id', type: 'int', nullable: true })
  parentFamilyId?: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'varchar', length: 100, nullable: true })
  updatedBy?: string;

  // Tree relationships
  @TreeParent()
  @ManyToOne('FamilyEntity', 'children')
  @JoinColumn({ name: 'parent_family_id' })
  parent?: FamilyEntity;

  @TreeChildren()
  @OneToMany('FamilyEntity', 'parent')
  children?: FamilyEntity[];

  // Product relationships
  @OneToMany('ProductEntity', 'family')
  products?: any[]; // Will be properly typed when ProductEntity is imported
}

/**
 * Package Entity - TypeORM Implementation
 * 
 * Product packaging variants with barcode management and dimensional data.
 */
@Entity('packages')
@Index(['productId'])
@Index(['code'], { unique: true })
@Index(['isDefault'])
@Index(['isActive'])
@Index(['unitOfMeasure'])
export class PackageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  description: string;

  @Column({ name: 'unit_of_measure', type: 'varchar', length: 20 })
  unitOfMeasure: string;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  quantity: number;

  @Column({ type: 'json', nullable: true })
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  weight?: number;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'json' })
  barcodes: string[];

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'varchar', length: 100, nullable: true })
  updatedBy?: string;

  // Relationships
  @ManyToOne('ProductEntity', 'packages')
  @JoinColumn({ name: 'product_id' })
  product?: any; // Will be properly typed when ProductEntity is imported
}
