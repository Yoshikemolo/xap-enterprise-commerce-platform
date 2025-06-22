import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

/**
 * Product Entity - TypeORM Implementation
 * 
 * Maps the Product domain entity to database table with all required relationships
 * and business constraints for enterprise product management.
 */
@Entity('products')
@Index(['productCode'], { unique: true })
@Index(['familyId'])
@Index(['isActive'])
@Index(['createdAt'])
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_code', type: 'varchar', length: 50, unique: true })
  productCode: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'family_id', type: 'int', nullable: true })
  familyId?: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  specifications?: Array<{
    key: string;
    value: string;
    unit?: string;
    description?: string;
  }>;

  @Column({ type: 'json', nullable: true })
  media?: Array<{
    id: string;
    type: 'image' | 'video' | 'document';
    url: string;
    altText?: string;
    isPrimary: boolean;
    sortOrder?: number;
    metadata?: Record<string, any>;
  }>;

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
  @ManyToOne('FamilyEntity', 'products')
  @JoinColumn({ name: 'family_id' })
  family?: any; // Will be properly typed when FamilyEntity is defined

  @OneToMany('StockEntity', 'product')
  stocks?: any[]; // Will be properly typed when StockEntity is defined

  @OneToMany('PackageEntity', 'product')
  packages?: any[]; // Will be properly typed when PackageEntity is defined
}
