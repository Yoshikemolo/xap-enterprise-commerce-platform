import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, TreeRepository } from 'typeorm';
import { FamilyRepository, PackageRepository } from '../../../domain/repositories';
import { Family, Package } from '../../../domain/entities';
import { FamilyEntity, PackageEntity } from '../entities/family.entity';
import { PaginatedResult, FamilyFilters, PackageFilters } from '../../../application/queries';
import { PaginationOptions } from '../../../application/dto';

/**
 * TypeORM Family Repository Implementation
 * 
 * Hierarchical family management with tree operations and subfamily support.
 */
@Injectable()
export class TypeOrmFamilyRepository implements FamilyRepository {
  constructor(
    @InjectRepository(FamilyEntity)
    private readonly familyEntityRepository: TreeRepository<FamilyEntity>
  ) {}

  async findById(id: number): Promise<Family | null> {
    const entity = await this.familyEntityRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'products']
    });

    return entity ? this.mapToDomain(entity) : null;
  }

  async findByCode(code: string): Promise<Family | null> {
    const entity = await this.familyEntityRepository.findOne({
      where: { code },
      relations: ['parent', 'children', 'products']
    });

    return entity ? this.mapToDomain(entity) : null;
  }

  async findMany(
    filters: FamilyFilters = {},
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Family>> {
    const queryBuilder = this.createBaseQueryBuilder();
    this.applyFilters(queryBuilder, filters);

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    if (pagination?.sortBy) {
      const sortOrder = pagination.sortOrder || 'ASC';
      queryBuilder.orderBy(`family.${pagination.sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('family.sortOrder', 'ASC').addOrderBy('family.name', 'ASC');
    }

    const [entities, total] = await queryBuilder.getManyAndCount();
    const families = entities.map(entity => this.mapToDomain(entity));

    return {
      data: families,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findActive(pagination?: PaginationOptions): Promise<PaginatedResult<Family>> {
    return this.findMany({ isActive: true }, pagination);
  }

  async search(searchTerm: string, pagination?: PaginationOptions): Promise<PaginatedResult<Family>> {
    const queryBuilder = this.createBaseQueryBuilder();
    
    queryBuilder.andWhere(
      '(family.name LIKE :searchTerm OR family.description LIKE :searchTerm OR family.code LIKE :searchTerm)',
      { searchTerm: `%${searchTerm}%` }
    );

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);
    queryBuilder.orderBy('family.name', 'ASC');

    const [entities, total] = await queryBuilder.getManyAndCount();
    const families = entities.map(entity => this.mapToDomain(entity));

    return {
      data: families,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findSubfamilies(parentFamilyId: number): Promise<Family[]> {
    const entities = await this.familyEntityRepository.find({
      where: { parentFamilyId },
      relations: ['parent', 'children'],
      order: { sortOrder: 'ASC', name: 'ASC' }
    });

    return entities.map(entity => this.mapToDomain(entity));
  }

  async findRootFamilies(pagination?: PaginationOptions): Promise<PaginatedResult<Family>> {
    return this.findMany({ parentFamilyId: null }, pagination);
  }

  async getHierarchy(familyId?: number): Promise<any> {
    if (familyId) {
      // Get specific family with its descendants
      const entity = await this.familyEntityRepository.findOne({
        where: { id: familyId },
        relations: ['children']
      });

      if (!entity) {
        return null;
      }

      const descendants = await this.familyEntityRepository.findDescendants(entity);
      return this.buildHierarchyTree(entity, descendants);
    } else {
      // Get all root families with their hierarchies
      const rootEntities = await this.familyEntityRepository.find({
        where: { parentFamilyId: null },
        order: { sortOrder: 'ASC', name: 'ASC' }
      });

      const hierarchies = [];
      for (const rootEntity of rootEntities) {
        const descendants = await this.familyEntityRepository.findDescendants(rootEntity);
        hierarchies.push(this.buildHierarchyTree(rootEntity, descendants));
      }

      return hierarchies;
    }
  }

  async save(family: Family): Promise<Family> {
    const entity = this.mapToEntity(family);
    const savedEntity = await this.familyEntityRepository.save(entity);
    return this.mapToDomain(savedEntity);
  }

  async delete(id: number): Promise<void> {
    await this.familyEntityRepository.delete(id);
  }

  async exists(code: string): Promise<boolean> {
    const count = await this.familyEntityRepository.count({
      where: { code }
    });
    return count > 0;
  }

  // Private helper methods
  private createBaseQueryBuilder(): SelectQueryBuilder<FamilyEntity> {
    return this.familyEntityRepository
      .createQueryBuilder('family')
      .leftJoinAndSelect('family.parent', 'parent')
      .leftJoinAndSelect('family.children', 'children')
      .leftJoinAndSelect('family.products', 'products');
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<FamilyEntity>, filters: FamilyFilters): void {
    if (filters.parentFamilyId !== undefined) {
      if (filters.parentFamilyId === null) {
        queryBuilder.andWhere('family.parentFamilyId IS NULL');
      } else {
        queryBuilder.andWhere('family.parentFamilyId = :parentFamilyId', { parentFamilyId: filters.parentFamilyId });
      }
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('family.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.codes && filters.codes.length > 0) {
      queryBuilder.andWhere('family.code IN (:...codes)', { codes: filters.codes });
    }
  }

  private buildHierarchyTree(entity: FamilyEntity, descendants: FamilyEntity[]): any {
    const family = this.mapToDomain(entity);
    const children = descendants
      .filter(d => d.parentFamilyId === entity.id)
      .map(child => this.buildHierarchyTree(child, descendants));

    return {
      family,
      children,
      level: this.calculateLevel(entity, descendants),
      hasProducts: (entity.products?.length || 0) > 0,
      productCount: entity.products?.length || 0
    };
  }

  private calculateLevel(entity: FamilyEntity, allEntities: FamilyEntity[]): number {
    let level = 0;
    let currentParentId = entity.parentFamilyId;

    while (currentParentId) {
      level++;
      const parent = allEntities.find(e => e.id === currentParentId);
      currentParentId = parent?.parentFamilyId;
    }

    return level;
  }

  private mapToDomain(entity: FamilyEntity): Family {
    return {
      id: entity.id,
      name: entity.name,
      code: entity.code,
      description: entity.description,
      parentFamilyId: entity.parentFamilyId,
      isActive: entity.isActive,
      metadata: entity.metadata || {},
      sortOrder: entity.sortOrder,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy
    } as Family;
  }

  private mapToEntity(family: Family): FamilyEntity {
    const entity = new FamilyEntity();
    
    if (family.id) {
      entity.id = family.id;
    }
    
    entity.name = family.name;
    entity.code = family.code;
    entity.description = family.description;
    entity.parentFamilyId = family.parentFamilyId;
    entity.isActive = family.isActive;
    entity.metadata = family.metadata;
    entity.sortOrder = family.sortOrder;
    entity.createdBy = family.createdBy;
    entity.updatedBy = family.updatedBy;

    return entity;
  }
}

/**
 * TypeORM Package Repository Implementation
 * 
 * Package variant management with barcode support and default package handling.
 */
@Injectable()
export class TypeOrmPackageRepository implements PackageRepository {
  constructor(
    @InjectRepository(PackageEntity)
    private readonly packageEntityRepository: Repository<PackageEntity>
  ) {}

  async findById(id: number): Promise<Package | null> {
    const entity = await this.packageEntityRepository.findOne({
      where: { id },
      relations: ['product']
    });

    return entity ? this.mapToDomain(entity) : null;
  }

  async findByCode(code: string): Promise<Package | null> {
    const entity = await this.packageEntityRepository.findOne({
      where: { code },
      relations: ['product']
    });

    return entity ? this.mapToDomain(entity) : null;
  }

  async findByProductId(productId: number): Promise<Package[]> {
    const entities = await this.packageEntityRepository.find({
      where: { productId },
      relations: ['product'],
      order: { isDefault: 'DESC', name: 'ASC' }
    });

    return entities.map(entity => this.mapToDomain(entity));
  }

  async findDefaultPackageByProductId(productId: number): Promise<Package | null> {
    const entity = await this.packageEntityRepository.findOne({
      where: { productId, isDefault: true },
      relations: ['product']
    });

    return entity ? this.mapToDomain(entity) : null;
  }

  async findByBarcode(barcode: string): Promise<Package | null> {
    // JSON query to find package with specific barcode
    const entity = await this.packageEntityRepository
      .createQueryBuilder('package')
      .where("JSON_CONTAINS(package.barcodes, :barcode)", { barcode: `"${barcode}"` })
      .leftJoinAndSelect('package.product', 'product')
      .getOne();

    return entity ? this.mapToDomain(entity) : null;
  }

  async findByBarcodes(barcodes: string[]): Promise<Package[]> {
    const entities: PackageEntity[] = [];

    for (const barcode of barcodes) {
      const entity = await this.packageEntityRepository
        .createQueryBuilder('package')
        .where("JSON_CONTAINS(package.barcodes, :barcode)", { barcode: `"${barcode}"` })
        .leftJoinAndSelect('package.product', 'product')
        .getOne();

      if (entity) {
        entities.push(entity);
      }
    }

    return entities.map(entity => this.mapToDomain(entity));
  }

  async findByUnitOfMeasure(unitOfMeasure: string): Promise<Package[]> {
    const entities = await this.packageEntityRepository.find({
      where: { unitOfMeasure },
      relations: ['product'],
      order: { name: 'ASC' }
    });

    return entities.map(entity => this.mapToDomain(entity));
  }

  async findMany(
    filters: PackageFilters = {},
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Package>> {
    const queryBuilder = this.createBaseQueryBuilder();
    this.applyFilters(queryBuilder, filters);

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    if (pagination?.sortBy) {
      const sortOrder = pagination.sortOrder || 'ASC';
      queryBuilder.orderBy(`package.${pagination.sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('package.isDefault', 'DESC').addOrderBy('package.name', 'ASC');
    }

    const [entities, total] = await queryBuilder.getManyAndCount();
    const packages = entities.map(entity => this.mapToDomain(entity));

    return {
      data: packages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findActive(pagination?: PaginationOptions): Promise<PaginatedResult<Package>> {
    return this.findMany({ isActive: true }, pagination);
  }

  async save(packageEntity: Package): Promise<Package> {
    const entity = this.mapToEntity(packageEntity);
    const savedEntity = await this.packageEntityRepository.save(entity);
    return this.mapToDomain(savedEntity);
  }

  async delete(id: number): Promise<void> {
    await this.packageEntityRepository.delete(id);
  }

  async exists(code: string): Promise<boolean> {
    const count = await this.packageEntityRepository.count({
      where: { code }
    });
    return count > 0;
  }

  // Private helper methods
  private createBaseQueryBuilder(): SelectQueryBuilder<PackageEntity> {
    return this.packageEntityRepository
      .createQueryBuilder('package')
      .leftJoinAndSelect('package.product', 'product');
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<PackageEntity>, filters: PackageFilters): void {
    if (filters.productId !== undefined) {
      queryBuilder.andWhere('package.productId = :productId', { productId: filters.productId });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('package.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.isDefault !== undefined) {
      queryBuilder.andWhere('package.isDefault = :isDefault', { isDefault: filters.isDefault });
    }

    if (filters.unitOfMeasure) {
      queryBuilder.andWhere('package.unitOfMeasure = :unitOfMeasure', { unitOfMeasure: filters.unitOfMeasure });
    }

    if (filters.codes && filters.codes.length > 0) {
      queryBuilder.andWhere('package.code IN (:...codes)', { codes: filters.codes });
    }

    if (filters.barcode) {
      queryBuilder.andWhere("JSON_CONTAINS(package.barcodes, :barcode)", { barcode: `"${filters.barcode}"` });
    }
  }

  private mapToDomain(entity: PackageEntity): Package {
    return {
      id: entity.id,
      productId: entity.productId,
      name: entity.name,
      code: entity.code,
      description: entity.description,
      unitOfMeasure: entity.unitOfMeasure,
      quantity: entity.quantity,
      dimensions: entity.dimensions,
      weight: entity.weight,
      isDefault: entity.isDefault,
      isActive: entity.isActive,
      barcodes: entity.barcodes || [],
      metadata: entity.metadata || {},
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy
    } as Package;
  }

  private mapToEntity(packageDomain: Package): PackageEntity {
    const entity = new PackageEntity();
    
    if (packageDomain.id) {
      entity.id = packageDomain.id;
    }
    
    entity.productId = packageDomain.productId;
    entity.name = packageDomain.name;
    entity.code = packageDomain.code;
    entity.description = packageDomain.description;
    entity.unitOfMeasure = packageDomain.unitOfMeasure;
    entity.quantity = packageDomain.quantity;
    entity.dimensions = packageDomain.dimensions;
    entity.weight = packageDomain.weight;
    entity.isDefault = packageDomain.isDefault;
    entity.isActive = packageDomain.isActive;
    entity.barcodes = packageDomain.barcodes;
    entity.metadata = packageDomain.metadata;
    entity.createdBy = packageDomain.createdBy;
    entity.updatedBy = packageDomain.updatedBy;

    return entity;
  }
}
