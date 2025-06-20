import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ProductRepository, FamilyRepository, PackageRepository, StockRepository } from '../../domain/repositories';
import { Product, Family, Package, Stock, ProductSpecification, ProductMedia, StockBatch, PackageDimensions } from '../../domain/entities';

// ============================================================================
// PRODUCT COMMANDS
// ============================================================================

export class CreateProductCommand implements ICommand {
  constructor(
    public readonly productCode: string,
    public readonly name: string,
    public readonly description?: string,
    public readonly familyId?: number,
    public readonly specifications?: ProductSpecification[],
    public readonly media?: ProductMedia[],
    public readonly createdBy?: string
  ) {}
}

export class UpdateProductCommand implements ICommand {
  constructor(
    public readonly productId: number,
    public readonly name?: string,
    public readonly description?: string,
    public readonly familyId?: number,
    public readonly metadata?: Record<string, any>,
    public readonly updatedBy?: string
  ) {}
}

export class DeleteProductCommand implements ICommand {
  constructor(
    public readonly productId: number,
    public readonly deletedBy?: string
  ) {}
}

export class ActivateProductCommand implements ICommand {
  constructor(
    public readonly productId: number,
    public readonly activatedBy?: string
  ) {}
}

export class DeactivateProductCommand implements ICommand {
  constructor(
    public readonly productId: number,
    public readonly deactivatedBy?: string
  ) {}
}

export class AddProductSpecificationCommand implements ICommand {
  constructor(
    public readonly productId: number,
    public readonly specification: ProductSpecification,
    public readonly updatedBy?: string
  ) {}
}

export class RemoveProductSpecificationCommand implements ICommand {
  constructor(
    public readonly productId: number,
    public readonly specificationKey: string,
    public readonly updatedBy?: string
  ) {}
}

export class AddProductMediaCommand implements ICommand {
  constructor(
    public readonly productId: number,
    public readonly media: ProductMedia,
    public readonly updatedBy?: string
  ) {}
}

export class RemoveProductMediaCommand implements ICommand {
  constructor(
    public readonly productId: number,
    public readonly mediaId: string,
    public readonly updatedBy?: string
  ) {}
}

export class SetPrimaryProductMediaCommand implements ICommand {
  constructor(
    public readonly productId: number,
    public readonly mediaId: string,
    public readonly updatedBy?: string
  ) {}
}

// ============================================================================
// STOCK COMMANDS
// ============================================================================

export class CreateStockCommand implements ICommand {
  constructor(
    public readonly productId: number,
    public readonly productCode: string,
    public readonly locationId: number,
    public readonly minimumLevel?: number,
    public readonly maximumLevel?: number,
    public readonly reorderPoint?: number,
    public readonly createdBy?: string
  ) {}
}

export class UpdateStockCommand implements ICommand {
  constructor(
    public readonly stockId: number,
    public readonly minimumLevel?: number,
    public readonly maximumLevel?: number,
    public readonly reorderPoint?: number,
    public readonly updatedBy?: string
  ) {}
}

export class AddStockBatchCommand implements ICommand {
  constructor(
    public readonly stockId: number,
    public readonly batchData: Omit<StockBatch, 'availableQuantity' | 'reservedQuantity' | 'status' | 'createdAt' | 'updatedAt'>,
    public readonly addedBy?: string
  ) {}
}

export class UpdateStockBatchCommand implements ICommand {
  constructor(
    public readonly stockId: number,
    public readonly batchNumber: string,
    public readonly updates: Partial<Pick<StockBatch, 'quantity' | 'expirationDate' | 'supplier' | 'cost' | 'location' | 'status' | 'metadata'>>,
    public readonly updatedBy?: string
  ) {}
}

export class ReserveStockCommand implements ICommand {
  constructor(
    public readonly stockId: number,
    public readonly quantity: number,
    public readonly orderId: string,
    public readonly preferFEFO: boolean = true,
    public readonly reservedBy?: string
  ) {}
}

export class ReleaseStockReservationCommand implements ICommand {
  constructor(
    public readonly stockId: number,
    public readonly batchNumber: string,
    public readonly quantity: number,
    public readonly orderId: string,
    public readonly releasedBy?: string
  ) {}
}

export class ConsumeStockCommand implements ICommand {
  constructor(
    public readonly stockId: number,
    public readonly batchNumber: string,
    public readonly quantity: number,
    public readonly orderId: string,
    public readonly consumedBy?: string
  ) {}
}

export class AdjustStockCommand implements ICommand {
  constructor(
    public readonly stockId: number,
    public readonly batchNumber: string,
    public readonly newQuantity: number,
    public readonly reason: string,
    public readonly adjustedBy?: string
  ) {}
}

// ============================================================================
// FAMILY COMMANDS
// ============================================================================

export class CreateFamilyCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly code: string,
    public readonly description?: string,
    public readonly parentFamilyId?: number,
    public readonly metadata?: Record<string, any>,
    public readonly sortOrder?: number,
    public readonly createdBy?: string
  ) {}
}

export class UpdateFamilyCommand implements ICommand {
  constructor(
    public readonly familyId: number,
    public readonly name?: string,
    public readonly description?: string,
    public readonly parentFamilyId?: number,
    public readonly metadata?: Record<string, any>,
    public readonly sortOrder?: number,
    public readonly updatedBy?: string
  ) {}
}

export class DeleteFamilyCommand implements ICommand {
  constructor(
    public readonly familyId: number,
    public readonly deletedBy?: string
  ) {}
}

export class ActivateFamilyCommand implements ICommand {
  constructor(
    public readonly familyId: number,
    public readonly activatedBy?: string
  ) {}
}

export class DeactivateFamilyCommand implements ICommand {
  constructor(
    public readonly familyId: number,
    public readonly deactivatedBy?: string
  ) {}
}

// ============================================================================
// PACKAGE COMMANDS
// ============================================================================

export class CreatePackageCommand implements ICommand {
  constructor(
    public readonly productId: number,
    public readonly name: string,
    public readonly code: string,
    public readonly description: string,
    public readonly unitOfMeasure: string,
    public readonly quantity: number,
    public readonly dimensions?: PackageDimensions,
    public readonly weight?: number,
    public readonly isDefault: boolean = false,
    public readonly barcodes?: string[],
    public readonly metadata?: Record<string, any>,
    public readonly createdBy?: string
  ) {}
}

export class UpdatePackageCommand implements ICommand {
  constructor(
    public readonly packageId: number,
    public readonly name?: string,
    public readonly description?: string,
    public readonly unitOfMeasure?: string,
    public readonly quantity?: number,
    public readonly dimensions?: PackageDimensions,
    public readonly weight?: number,
    public readonly metadata?: Record<string, any>,
    public readonly updatedBy?: string
  ) {}
}

export class DeletePackageCommand implements ICommand {
  constructor(
    public readonly packageId: number,
    public readonly deletedBy?: string
  ) {}
}

export class ActivatePackageCommand implements ICommand {
  constructor(
    public readonly packageId: number,
    public readonly activatedBy?: string
  ) {}
}

export class DeactivatePackageCommand implements ICommand {
  constructor(
    public readonly packageId: number,
    public readonly deactivatedBy?: string
  ) {}
}

export class SetPackageAsDefaultCommand implements ICommand {
  constructor(
    public readonly packageId: number,
    public readonly productId: number,
    public readonly setBy?: string
  ) {}
}

export class AddPackageBarcodeCommand implements ICommand {
  constructor(
    public readonly packageId: number,
    public readonly barcode: string,
    public readonly addedBy?: string
  ) {}
}

export class RemovePackageBarcodeCommand implements ICommand {
  constructor(
    public readonly packageId: number,
    public readonly barcode: string,
    public readonly removedBy?: string
  ) {}
}

// ============================================================================
// COMMAND HANDLERS
// ============================================================================

// Product Command Handlers
@CommandHandler(CreateProductCommand)
export class CreateProductCommandHandler implements ICommandHandler<CreateProductCommand> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: CreateProductCommand): Promise<Product> {
    // Check if product code already exists
    const existingProduct = await this.productRepository.findByProductCode(command.productCode);
    if (existingProduct) {
      throw new Error(`Product with code ${command.productCode} already exists`);
    }

    const product = Product.create({
      productCode: command.productCode,
      name: command.name,
      description: command.description,
      familyId: command.familyId,
      isActive: true,
      specifications: command.specifications || [],
      media: command.media || []
    });

    return await this.productRepository.save(product);
  }
}

@CommandHandler(UpdateProductCommand)
export class UpdateProductCommandHandler implements ICommandHandler<UpdateProductCommand> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: UpdateProductCommand): Promise<void> {
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new Error(`Product with ID ${command.productId} not found`);
    }

    product.updateProduct({
      name: command.name,
      description: command.description,
      familyId: command.familyId,
      metadata: command.metadata
    });

    await this.productRepository.save(product);
  }
}

@CommandHandler(DeleteProductCommand)
export class DeleteProductCommandHandler implements ICommandHandler<DeleteProductCommand> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: DeleteProductCommand): Promise<void> {
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new Error(`Product with ID ${command.productId} not found`);
    }

    await this.productRepository.delete(command.productId);
  }
}

@CommandHandler(ActivateProductCommand)
export class ActivateProductCommandHandler implements ICommandHandler<ActivateProductCommand> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: ActivateProductCommand): Promise<void> {
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new Error(`Product with ID ${command.productId} not found`);
    }

    product.activate();
    await this.productRepository.save(product);
  }
}

@CommandHandler(DeactivateProductCommand)
export class DeactivateProductCommandHandler implements ICommandHandler<DeactivateProductCommand> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: DeactivateProductCommand): Promise<void> {
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new Error(`Product with ID ${command.productId} not found`);
    }

    product.deactivate();
    await this.productRepository.save(product);
  }
}

@CommandHandler(AddProductSpecificationCommand)
export class AddProductSpecificationCommandHandler implements ICommandHandler<AddProductSpecificationCommand> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: AddProductSpecificationCommand): Promise<void> {
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new Error(`Product with ID ${command.productId} not found`);
    }

    product.addSpecification(command.specification);
    await this.productRepository.save(product);
  }
}

@CommandHandler(RemoveProductSpecificationCommand)
export class RemoveProductSpecificationCommandHandler implements ICommandHandler<RemoveProductSpecificationCommand> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: RemoveProductSpecificationCommand): Promise<void> {
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new Error(`Product with ID ${command.productId} not found`);
    }

    product.removeSpecification(command.specificationKey);
    await this.productRepository.save(product);
  }
}

@CommandHandler(AddProductMediaCommand)
export class AddProductMediaCommandHandler implements ICommandHandler<AddProductMediaCommand> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: AddProductMediaCommand): Promise<void> {
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new Error(`Product with ID ${command.productId} not found`);
    }

    product.addMedia(command.media);
    await this.productRepository.save(product);
  }
}

@CommandHandler(RemoveProductMediaCommand)
export class RemoveProductMediaCommandHandler implements ICommandHandler<RemoveProductMediaCommand> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: RemoveProductMediaCommand): Promise<void> {
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new Error(`Product with ID ${command.productId} not found`);
    }

    product.removeMedia(command.mediaId);
    await this.productRepository.save(product);
  }
}

@CommandHandler(SetPrimaryProductMediaCommand)
export class SetPrimaryProductMediaCommandHandler implements ICommandHandler<SetPrimaryProductMediaCommand> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: SetPrimaryProductMediaCommand): Promise<void> {
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new Error(`Product with ID ${command.productId} not found`);
    }

    product.setPrimaryMedia(command.mediaId);
    await this.productRepository.save(product);
  }
}

// Stock Command Handlers
@CommandHandler(CreateStockCommand)
export class CreateStockCommandHandler implements ICommandHandler<CreateStockCommand> {
  constructor(
    private readonly stockRepository: StockRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(command: CreateStockCommand): Promise<Stock> {
    // Verify product exists
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new Error(`Product with ID ${command.productId} not found`);
    }

    // Check if stock already exists for this product and location
    const existingStock = await this.stockRepository.findByProductAndLocation(
      command.productId,
      command.locationId
    );
    if (existingStock) {
      throw new Error(`Stock already exists for product ${command.productCode} at location ${command.locationId}`);
    }

    const stock = Stock.create({
      productId: command.productId,
      productCode: command.productCode,
      locationId: command.locationId,
      minimumLevel: command.minimumLevel,
      maximumLevel: command.maximumLevel,
      reorderPoint: command.reorderPoint,
      isActive: true
    });

    return await this.stockRepository.save(stock);
  }
}

@CommandHandler(UpdateStockCommand)
export class UpdateStockCommandHandler implements ICommandHandler<UpdateStockCommand> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(command: UpdateStockCommand): Promise<void> {
    const stock = await this.stockRepository.findById(command.stockId);
    if (!stock) {
      throw new Error(`Stock with ID ${command.stockId} not found`);
    }

    if (command.minimumLevel !== undefined) {
      stock.setMinimumLevel(command.minimumLevel);
    }

    if (command.maximumLevel !== undefined) {
      stock.setMaximumLevel(command.maximumLevel);
    }

    if (command.reorderPoint !== undefined) {
      stock.setReorderPoint(command.reorderPoint);
    }

    await this.stockRepository.save(stock);
  }
}

@CommandHandler(AddStockBatchCommand)
export class AddStockBatchCommandHandler implements ICommandHandler<AddStockBatchCommand> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(command: AddStockBatchCommand): Promise<void> {
    const stock = await this.stockRepository.findById(command.stockId);
    if (!stock) {
      throw new Error(`Stock with ID ${command.stockId} not found`);
    }

    stock.addBatch(command.batchData);
    await this.stockRepository.save(stock);
  }
}

@CommandHandler(UpdateStockBatchCommand)
export class UpdateStockBatchCommandHandler implements ICommandHandler<UpdateStockBatchCommand> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(command: UpdateStockBatchCommand): Promise<void> {
    const stock = await this.stockRepository.findById(command.stockId);
    if (!stock) {
      throw new Error(`Stock with ID ${command.stockId} not found`);
    }

    stock.updateBatch(command.batchNumber, command.updates);
    await this.stockRepository.save(stock);
  }
}

@CommandHandler(ReserveStockCommand)
export class ReserveStockCommandHandler implements ICommandHandler<ReserveStockCommand> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(command: ReserveStockCommand): Promise<{ batchNumber: string; quantity: number }[]> {
    const stock = await this.stockRepository.findById(command.stockId);
    if (!stock) {
      throw new Error(`Stock with ID ${command.stockId} not found`);
    }

    const reservations = stock.reserveStock(
      command.quantity,
      command.orderId,
      command.preferFEFO
    );

    await this.stockRepository.save(stock);
    return reservations;
  }
}

@CommandHandler(ReleaseStockReservationCommand)
export class ReleaseStockReservationCommandHandler implements ICommandHandler<ReleaseStockReservationCommand> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(command: ReleaseStockReservationCommand): Promise<void> {
    const stock = await this.stockRepository.findById(command.stockId);
    if (!stock) {
      throw new Error(`Stock with ID ${command.stockId} not found`);
    }

    stock.releaseReservation(command.batchNumber, command.quantity, command.orderId);
    await this.stockRepository.save(stock);
  }
}

@CommandHandler(ConsumeStockCommand)
export class ConsumeStockCommandHandler implements ICommandHandler<ConsumeStockCommand> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(command: ConsumeStockCommand): Promise<void> {
    const stock = await this.stockRepository.findById(command.stockId);
    if (!stock) {
      throw new Error(`Stock with ID ${command.stockId} not found`);
    }

    stock.consumeStock(command.batchNumber, command.quantity, command.orderId);
    await this.stockRepository.save(stock);
  }
}

// Family Command Handlers
@CommandHandler(CreateFamilyCommand)
export class CreateFamilyCommandHandler implements ICommandHandler<CreateFamilyCommand> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(command: CreateFamilyCommand): Promise<Family> {
    // Check if family code already exists
    const existingFamily = await this.familyRepository.findByCode(command.code);
    if (existingFamily) {
      throw new Error(`Family with code ${command.code} already exists`);
    }

    const family = Family.create({
      name: command.name,
      code: command.code,
      description: command.description,
      parentFamilyId: command.parentFamilyId,
      isActive: true,
      metadata: command.metadata || {},
      sortOrder: command.sortOrder || 0
    });

    return await this.familyRepository.save(family);
  }
}

@CommandHandler(UpdateFamilyCommand)
export class UpdateFamilyCommandHandler implements ICommandHandler<UpdateFamilyCommand> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(command: UpdateFamilyCommand): Promise<void> {
    const family = await this.familyRepository.findById(command.familyId);
    if (!family) {
      throw new Error(`Family with ID ${command.familyId} not found`);
    }

    family.updateFamily({
      name: command.name,
      description: command.description,
      parentFamilyId: command.parentFamilyId,
      metadata: command.metadata,
      sortOrder: command.sortOrder
    });

    await this.familyRepository.save(family);
  }
}

@CommandHandler(DeleteFamilyCommand)
export class DeleteFamilyCommandHandler implements ICommandHandler<DeleteFamilyCommand> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(command: DeleteFamilyCommand): Promise<void> {
    const family = await this.familyRepository.findById(command.familyId);
    if (!family) {
      throw new Error(`Family with ID ${command.familyId} not found`);
    }

    await this.familyRepository.delete(command.familyId);
  }
}

@CommandHandler(ActivateFamilyCommand)
export class ActivateFamilyCommandHandler implements ICommandHandler<ActivateFamilyCommand> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(command: ActivateFamilyCommand): Promise<void> {
    const family = await this.familyRepository.findById(command.familyId);
    if (!family) {
      throw new Error(`Family with ID ${command.familyId} not found`);
    }

    family.activate();
    await this.familyRepository.save(family);
  }
}

@CommandHandler(DeactivateFamilyCommand)
export class DeactivateFamilyCommandHandler implements ICommandHandler<DeactivateFamilyCommand> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(command: DeactivateFamilyCommand): Promise<void> {
    const family = await this.familyRepository.findById(command.familyId);
    if (!family) {
      throw new Error(`Family with ID ${command.familyId} not found`);
    }

    family.deactivate();
    await this.familyRepository.save(family);
  }
}

// Package Command Handlers
@CommandHandler(CreatePackageCommand)
export class CreatePackageCommandHandler implements ICommandHandler<CreatePackageCommand> {
  constructor(
    private readonly packageRepository: PackageRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(command: CreatePackageCommand): Promise<Package> {
    // Verify product exists
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new Error(`Product with ID ${command.productId} not found`);
    }

    // Check if package code already exists
    const existingPackage = await this.packageRepository.findByCode(command.code);
    if (existingPackage) {
      throw new Error(`Package with code ${command.code} already exists`);
    }

    const packageEntity = Package.create({
      productId: command.productId,
      name: command.name,
      code: command.code,
      description: command.description,
      unitOfMeasure: command.unitOfMeasure,
      quantity: command.quantity,
      dimensions: command.dimensions,
      weight: command.weight,
      isDefault: command.isDefault,
      isActive: true,
      barcodes: command.barcodes || [],
      metadata: command.metadata || {}
    });

    return await this.packageRepository.save(packageEntity);
  }
}

@CommandHandler(UpdatePackageCommand)
export class UpdatePackageCommandHandler implements ICommandHandler<UpdatePackageCommand> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(command: UpdatePackageCommand): Promise<void> {
    const packageEntity = await this.packageRepository.findById(command.packageId);
    if (!packageEntity) {
      throw new Error(`Package with ID ${command.packageId} not found`);
    }

    packageEntity.updatePackage({
      name: command.name,
      description: command.description,
      unitOfMeasure: command.unitOfMeasure,
      quantity: command.quantity,
      dimensions: command.dimensions,
      weight: command.weight,
      metadata: command.metadata
    });

    await this.packageRepository.save(packageEntity);
  }
}

@CommandHandler(DeletePackageCommand)
export class DeletePackageCommandHandler implements ICommandHandler<DeletePackageCommand> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(command: DeletePackageCommand): Promise<void> {
    const packageEntity = await this.packageRepository.findById(command.packageId);
    if (!packageEntity) {
      throw new Error(`Package with ID ${command.packageId} not found`);
    }

    await this.packageRepository.delete(command.packageId);
  }
}

@CommandHandler(ActivatePackageCommand)
export class ActivatePackageCommandHandler implements ICommandHandler<ActivatePackageCommand> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(command: ActivatePackageCommand): Promise<void> {
    const packageEntity = await this.packageRepository.findById(command.packageId);
    if (!packageEntity) {
      throw new Error(`Package with ID ${command.packageId} not found`);
    }

    packageEntity.activate();
    await this.packageRepository.save(packageEntity);
  }
}

@CommandHandler(DeactivatePackageCommand)
export class DeactivatePackageCommandHandler implements ICommandHandler<DeactivatePackageCommand> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(command: DeactivatePackageCommand): Promise<void> {
    const packageEntity = await this.packageRepository.findById(command.packageId);
    if (!packageEntity) {
      throw new Error(`Package with ID ${command.packageId} not found`);
    }

    packageEntity.deactivate();
    await this.packageRepository.save(packageEntity);
  }
}

@CommandHandler(SetPackageAsDefaultCommand)
export class SetPackageAsDefaultCommandHandler implements ICommandHandler<SetPackageAsDefaultCommand> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(command: SetPackageAsDefaultCommand): Promise<void> {
    const packageEntity = await this.packageRepository.findById(command.packageId);
    if (!packageEntity) {
      throw new Error(`Package with ID ${command.packageId} not found`);
    }

    // First, unset any existing default package for this product
    const existingDefaultPackage = await this.packageRepository.findDefaultPackageByProductId(command.productId);
    if (existingDefaultPackage && existingDefaultPackage.id !== command.packageId) {
      existingDefaultPackage.unsetAsDefault();
      await this.packageRepository.save(existingDefaultPackage);
    }

    // Set the new default package
    packageEntity.setAsDefault();
    await this.packageRepository.save(packageEntity);
  }
}

@CommandHandler(AddPackageBarcodeCommand)
export class AddPackageBarcodeCommandHandler implements ICommandHandler<AddPackageBarcodeCommand> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(command: AddPackageBarcodeCommand): Promise<void> {
    const packageEntity = await this.packageRepository.findById(command.packageId);
    if (!packageEntity) {
      throw new Error(`Package with ID ${command.packageId} not found`);
    }

    packageEntity.addBarcode(command.barcode);
    await this.packageRepository.save(packageEntity);
  }
}

@CommandHandler(RemovePackageBarcodeCommand)
export class RemovePackageBarcodeCommandHandler implements ICommandHandler<RemovePackageBarcodeCommand> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(command: RemovePackageBarcodeCommand): Promise<void> {
    const packageEntity = await this.packageRepository.findById(command.packageId);
    if (!packageEntity) {
      throw new Error(`Package with ID ${command.packageId} not found`);
    }

    packageEntity.removeBarcode(command.barcode);
    await this.packageRepository.save(packageEntity);
  }
}

// Export all commands and handlers
export const ProductCommands = [
  CreateProductCommand,
  UpdateProductCommand,
  DeleteProductCommand,
  ActivateProductCommand,
  DeactivateProductCommand,
  AddProductSpecificationCommand,
  RemoveProductSpecificationCommand,
  AddProductMediaCommand,
  RemoveProductMediaCommand,
  SetPrimaryProductMediaCommand
];

export const StockCommands = [
  CreateStockCommand,
  UpdateStockCommand,
  AddStockBatchCommand,
  UpdateStockBatchCommand,
  ReserveStockCommand,
  ReleaseStockReservationCommand,
  ConsumeStockCommand,
  AdjustStockCommand
];

export const FamilyCommands = [
  CreateFamilyCommand,
  UpdateFamilyCommand,
  DeleteFamilyCommand,
  ActivateFamilyCommand,
  DeactivateFamilyCommand
];

export const PackageCommands = [
  CreatePackageCommand,
  UpdatePackageCommand,
  DeletePackageCommand,
  ActivatePackageCommand,
  DeactivatePackageCommand,
  SetPackageAsDefaultCommand,
  AddPackageBarcodeCommand,
  RemovePackageBarcodeCommand
];

export const CommandHandlers = [
  CreateProductCommandHandler,
  UpdateProductCommandHandler,
  DeleteProductCommandHandler,
  ActivateProductCommandHandler,
  DeactivateProductCommandHandler,
  AddProductSpecificationCommandHandler,
  RemoveProductSpecificationCommandHandler,
  AddProductMediaCommandHandler,
  RemoveProductMediaCommandHandler,
  SetPrimaryProductMediaCommandHandler,
  CreateStockCommandHandler,
  UpdateStockCommandHandler,
  AddStockBatchCommandHandler,
  UpdateStockBatchCommandHandler,
  ReserveStockCommandHandler,
  ReleaseStockReservationCommandHandler,
  ConsumeStockCommandHandler,
  CreateFamilyCommandHandler,
  UpdateFamilyCommandHandler,
  DeleteFamilyCommandHandler,
  ActivateFamilyCommandHandler,
  DeactivateFamilyCommandHandler,
  CreatePackageCommandHandler,
  UpdatePackageCommandHandler,
  DeletePackageCommandHandler,
  ActivatePackageCommandHandler,
  DeactivatePackageCommandHandler,
  SetPackageAsDefaultCommandHandler,
  AddPackageBarcodeCommandHandler,
  RemovePackageBarcodeCommandHandler
];