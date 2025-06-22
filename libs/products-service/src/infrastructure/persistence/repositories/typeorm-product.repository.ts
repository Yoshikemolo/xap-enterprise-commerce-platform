import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, FindManyOptions } from 'typeorm';
import { ProductRepository } from '../../../domain/repositories';
import { Product } from '../../../domain/entities';
import { ProductEntity } from '../entities/product.entity';
import { PaginatedResult, ProductFilters } from '../../../application/queries';
import { PaginationOptions } from '../../../application/dto';

/**
 * TypeORM Product Repository Implementation
 * 
 * Implements the domain ProductRepository interface using TypeORM
 * with advanced querying, search, and business logic support.
 */
@Injectable()
export class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productEntityRepository: Repository<ProductEntity>
  ) {}

  async findById(id: number): Promise<Product | null> {
    const entity = await this.productEntityRepository.findOne({
      where: { id },
      relations: ['family', 'stocks', 'packages']
    });

    return entity ? this.mapToDomain(entity) : null;
  }

  async findByProductCode(productCode: string): Promise<Product | null> {
    const entity = await this.productEntityRepository.findOne({
      where: { productCode },
      relations: ['family', 'stocks', 'packages']
    });

    return entity ? this.mapToDomain(entity) : null;
  }

  async findByProductCodes(productCodes: string[]): Promise<Product[]> {
    const entities = await this.productEntityRepository.find({
      where: { productCode: { $in: productCodes } as any },
      relations: ['family', 'stocks', 'packages']
    });

    return entities.map(entity => this.mapToDomain(entity));
  }

  async findMany(
    filters: ProductFilters = {},
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    const queryBuilder = this.createBaseQueryBuilder();
    this.applyFilters(queryBuilder, filters);

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    // Apply sorting
    if (pagination?.sortBy) {
      const sortOrder = pagination.sortOrder || 'ASC';
      queryBuilder.orderBy(`product.${pagination.sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('product.createdAt', 'DESC');
    }

    const [entities, total] = await queryBuilder.getManyAndCount();
    const products = entities.map(entity => this.mapToDomain(entity));

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findActive(pagination?: PaginationOptions): Promise<PaginatedResult<Product>> {
    return this.findMany({ isActive: true }, pagination);
  }

  async findByFamily(
    familyId: number,
    includeSubfamilies: boolean = false,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    const queryBuilder = this.createBaseQueryBuilder();

    if (includeSubfamilies) {
      // This would require a more complex query to find all subfamily IDs
      // For now, we'll implement the simple case
      queryBuilder.andWhere('product.familyId = :familyId', { familyId });
    } else {
      queryBuilder.andWhere('product.familyId = :familyId', { familyId });
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    if (pagination?.sortBy) {
      const sortOrder = pagination.sortOrder || 'ASC';
      queryBuilder.orderBy(`product.${pagination.sortBy}`, sortOrder);
    }

    const [entities, total] = await queryBuilder.getManyAndCount();
    const products = entities.map(entity => this.mapToDomain(entity));

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async search(
    searchTerm: string,
    filters?: ProductFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    const queryBuilder = this.createBaseQueryBuilder();

    // Apply search across multiple fields
    queryBuilder.andWhere(
      '(product.name LIKE :searchTerm OR product.description LIKE :searchTerm OR product.productCode LIKE :searchTerm)',
      { searchTerm: `%${searchTerm}%` }
    );

    if (filters) {
      this.applyFilters(queryBuilder, filters);
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    if (pagination?.sortBy) {
      const sortOrder = pagination.sortOrder || 'ASC';
      queryBuilder.orderBy(`product.${pagination.sortBy}`, sortOrder);
    } else {
      // Order by relevance (products matching in name first, then description, then code)
      queryBuilder.orderBy('product.name', 'ASC');
    }

    const [entities, total] = await queryBuilder.getManyAndCount();
    const products = entities.map(entity => this.mapToDomain(entity));

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async save(product: Product): Promise<Product> {
    const entity = this.mapToEntity(product);
    const savedEntity = await this.productEntityRepository.save(entity);
    return this.mapToDomain(savedEntity);
  }

  async delete(id: number): Promise<void> {
    await this.productEntityRepository.delete(id);
  }

  async exists(productCode: string): Promise<boolean> {
    const count = await this.productEntityRepository.count({
      where: { productCode }
    });
    return count > 0;
  }

  // Private helper methods
  private createBaseQueryBuilder(): SelectQueryBuilder<ProductEntity> {
    return this.productEntityRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.family', 'family')
      .leftJoinAndSelect('product.stocks', 'stocks')
      .leftJoinAndSelect('product.packages', 'packages');
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<ProductEntity>, filters: ProductFilters): void {
    if (filters.familyId !== undefined) {
      queryBuilder.andWhere('product.familyId = :familyId', { familyId: filters.familyId });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.productCodes && filters.productCodes.length > 0) {
      queryBuilder.andWhere('product.productCode IN (:...productCodes)', { productCodes: filters.productCodes });
    }

    if (filters.createdAfter) {
      queryBuilder.andWhere('product.createdAt >= :createdAfter', { createdAfter: filters.createdAfter });
    }

    if (filters.createdBefore) {
      queryBuilder.andWhere('product.createdAt <= :createdBefore', { createdBefore: filters.createdBefore });
    }

    if (filters.hasStock !== undefined) {
      if (filters.hasStock) {
        queryBuilder.andWhere('stocks.totalQuantity > 0');
      } else {
        queryBuilder.andWhere('(stocks.totalQuantity = 0 OR stocks.totalQuantity IS NULL)');
      }
    }
  }

  private mapToDomain(entity: ProductEntity): Product {
    // Create domain Product from entity
    // This is a simplified mapping - in a real implementation, you'd use the domain factory
    return {
      id: entity.id,
      productCode: entity.productCode,
      name: entity.name,
      description: entity.description,
      familyId: entity.familyId,
      isActive: entity.isActive,
      specifications: entity.specifications || [],
      media: entity.media || [],
      metadata: entity.metadata || {},
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy
    } as Product;
  }

  private mapToEntity(product: Product): ProductEntity {
    const entity = new ProductEntity();
    
    if (product.id) {
      entity.id = product.id;
    }
    
    entity.productCode = product.productCode;
    entity.name = product.name;
    entity.description = product.description;
    entity.familyId = product.familyId;
    entity.isActive = product.isActive;
    entity.specifications = product.specifications;
    entity.media = product.media;
    entity.metadata = product.metadata;
    entity.createdBy = product.createdBy;
    entity.updatedBy = product.updatedBy;

    return entity;
  }
}
