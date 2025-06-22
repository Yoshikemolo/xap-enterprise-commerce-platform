import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

// Import Commands
import {
  CreatePackageCommand,
  UpdatePackageCommand,
  DeletePackageCommand,
  ActivatePackageCommand,
  DeactivatePackageCommand,
  SetPackageAsDefaultCommand,
  AddPackageBarcodeCommand,
  RemovePackageBarcodeCommand
} from '../commands';

// Import Queries
import {
  GetPackageByIdQuery,
  GetPackageByCodeQuery,
  GetPackagesQuery,
  GetPackagesByProductQuery,
  GetActivePackagesQuery,
  GetDefaultPackageQuery,
  GetPackageByBarcodeQuery,
  GetPackagesByBarcodeQuery,
  GetPackagesByUnitOfMeasureQuery,
  PaginatedResult
} from '../queries';

// Import DTOs
import {
  CreatePackageDto,
  UpdatePackageDto,
  PackageFiltersDto,
  PaginationDto,
  AddPackageBarcodeDto,
  RemovePackageBarcodeDto,
  PackageResponseDto,
  ApiResponseDto,
  OperationResultDto
} from '../dto';

import { Package } from '../../domain/entities';

/**
 * Package Application Service
 * 
 * Orchestrates package-related operations for product variants.
 * Manages barcodes, dimensions, and default package settings.
 * 
 * Features:
 * - Package variant management
 * - Barcode operations
 * - Default package assignment
 * - Unit of measure handling
 * - Package activation/deactivation
 * - Business rule enforcement
 */
@Injectable()
export class PackageApplicationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // ============================================================================
  // PACKAGE CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new package with validation
   */
  async createPackage(createPackageDto: CreatePackageDto): Promise<ApiResponseDto<PackageResponseDto>> {
    try {
      // Check if package code already exists
      const existingPackage = await this.queryBus.execute(
        new GetPackageByCodeQuery(createPackageDto.code)
      );

      if (existingPackage) {
        return new ApiResponseDto({
          success: false,
          message: `Package with code '${createPackageDto.code}' already exists`,
          errors: ['PACKAGE_CODE_ALREADY_EXISTS']
        });
      }

      // Validate barcodes if provided
      if (createPackageDto.barcodes && createPackageDto.barcodes.length > 0) {
        for (const barcode of createPackageDto.barcodes) {
          const existingBarcodePackage = await this.queryBus.execute(
            new GetPackageByBarcodeQuery(barcode)
          );

          if (existingBarcodePackage) {
            return new ApiResponseDto({
              success: false,
              message: `Barcode '${barcode}' is already in use by another package`,
              errors: ['BARCODE_ALREADY_EXISTS']
            });
          }
        }
      }

      // If this is set as default, check if there's already a default package for this product
      if (createPackageDto.isDefault) {
        const existingDefault = await this.queryBus.execute(
          new GetDefaultPackageQuery(createPackageDto.productId)
        );

        if (existingDefault) {
          return new ApiResponseDto({
            success: false,
            message: `Product already has a default package. Please unset the current default first.`,
            errors: ['PRODUCT_ALREADY_HAS_DEFAULT_PACKAGE']
          });
        }
      }

      // Create the package
      const packageEntity: Package = await this.commandBus.execute(
        new CreatePackageCommand(
          createPackageDto.productId,
          createPackageDto.name,
          createPackageDto.code,
          createPackageDto.description,
          createPackageDto.unitOfMeasure,
          createPackageDto.quantity,
          createPackageDto.dimensions,
          createPackageDto.weight,
          createPackageDto.isDefault,
          createPackageDto.barcodes,
          createPackageDto.metadata,
          createPackageDto.createdBy
        )
      );

      return new ApiResponseDto({
        success: true,
        message: 'Package created successfully',
        data: this.mapToPackageResponse(packageEntity)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to create package',
        errors: ['PACKAGE_CREATION_FAILED']
      });
    }
  }

  /**
   * Update an existing package
   */
  async updatePackage(packageId: number, updatePackageDto: UpdatePackageDto): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify package exists
      const packageEntity = await this.queryBus.execute(new GetPackageByIdQuery(packageId));
      if (!packageEntity) {
        return new ApiResponseDto({
          success: false,
          message: `Package with ID ${packageId} not found`,
          errors: ['PACKAGE_NOT_FOUND']
        });
      }

      // Validate quantity if provided
      if (updatePackageDto.quantity !== undefined && updatePackageDto.quantity <= 0) {
        return new ApiResponseDto({
          success: false,
          message: 'Package quantity must be greater than zero',
          errors: ['INVALID_PACKAGE_QUANTITY']
        });
      }

      // Update the package
      await this.commandBus.execute(
        new UpdatePackageCommand(
          packageId,
          updatePackageDto.name,
          updatePackageDto.description,
          updatePackageDto.unitOfMeasure,
          updatePackageDto.quantity,
          updatePackageDto.dimensions,
          updatePackageDto.weight,
          updatePackageDto.metadata,
          updatePackageDto.updatedBy
        )
      );

      return new ApiResponseDto({
        success: true,
        message: 'Package updated successfully',
        data: new OperationResultDto(true, 'Package updated successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to update package',
        errors: ['PACKAGE_UPDATE_FAILED']
      });
    }
  }

  /**
   * Delete a package
   */
  async deletePackage(packageId: number, deletedBy?: string): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify package exists
      const packageEntity = await this.queryBus.execute(new GetPackageByIdQuery(packageId));
      if (!packageEntity) {
        return new ApiResponseDto({
          success: false,
          message: `Package with ID ${packageId} not found`,
          errors: ['PACKAGE_NOT_FOUND']
        });
      }

      // Check if this is the default package for the product
      if (packageEntity.isDefault) {
        return new ApiResponseDto({
          success: false,
          message: 'Cannot delete the default package. Please set another package as default first.',
          errors: ['CANNOT_DELETE_DEFAULT_PACKAGE']
        });
      }

      // Delete the package
      await this.commandBus.execute(new DeletePackageCommand(packageId, deletedBy));

      return new ApiResponseDto({
        success: true,
        message: 'Package deleted successfully',
        data: new OperationResultDto(true, 'Package deleted successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to delete package',
        errors: ['PACKAGE_DELETE_FAILED']
      });
    }
  }

  // ============================================================================
  // PACKAGE LIFECYCLE OPERATIONS
  // ============================================================================

  /**
   * Activate a package
   */
  async activatePackage(packageId: number, activatedBy?: string): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      await this.commandBus.execute(new ActivatePackageCommand(packageId, activatedBy));
      
      return new ApiResponseDto({
        success: true,
        message: 'Package activated successfully',
        data: new OperationResultDto(true, 'Package activated successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to activate package',
        errors: ['PACKAGE_ACTIVATION_FAILED']
      });
    }
  }

  /**
   * Deactivate a package
   */
  async deactivatePackage(packageId: number, deactivatedBy?: string): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Check if this is the default package
      const packageEntity = await this.queryBus.execute(new GetPackageByIdQuery(packageId));
      if (packageEntity?.isDefault) {
        return new ApiResponseDto({
          success: false,
          message: 'Cannot deactivate the default package. Please set another package as default first.',
          errors: ['CANNOT_DEACTIVATE_DEFAULT_PACKAGE']
        });
      }

      await this.commandBus.execute(new DeactivatePackageCommand(packageId, deactivatedBy));
      
      return new ApiResponseDto({
        success: true,
        message: 'Package deactivated successfully',
        data: new OperationResultDto(true, 'Package deactivated successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to deactivate package',
        errors: ['PACKAGE_DEACTIVATION_FAILED']
      });
    }
  }

  /**
   * Set package as default for product
   */
  async setPackageAsDefault(packageId: number, setBy?: string): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify package exists and is active
      const packageEntity = await this.queryBus.execute(new GetPackageByIdQuery(packageId));
      if (!packageEntity) {
        return new ApiResponseDto({
          success: false,
          message: `Package with ID ${packageId} not found`,
          errors: ['PACKAGE_NOT_FOUND']
        });
      }

      if (!packageEntity.isActive) {
        return new ApiResponseDto({
          success: false,
          message: 'Cannot set inactive package as default',
          errors: ['CANNOT_SET_INACTIVE_PACKAGE_AS_DEFAULT']
        });
      }

      // Set as default
      await this.commandBus.execute(
        new SetPackageAsDefaultCommand(packageId, packageEntity.productId, setBy)
      );

      return new ApiResponseDto({
        success: true,
        message: 'Package set as default successfully',
        data: new OperationResultDto(true, 'Package is now the default for this product')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to set package as default',
        errors: ['SET_DEFAULT_PACKAGE_FAILED']
      });
    }
  }

  // ============================================================================
  // BARCODE MANAGEMENT OPERATIONS
  // ============================================================================

  /**
   * Add barcode to package
   */
  async addPackageBarcode(
    packageId: number, 
    addBarcodeDto: AddPackageBarcodeDto
  ): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify package exists
      const packageEntity = await this.queryBus.execute(new GetPackageByIdQuery(packageId));
      if (!packageEntity) {
        return new ApiResponseDto({
          success: false,
          message: `Package with ID ${packageId} not found`,
          errors: ['PACKAGE_NOT_FOUND']
        });
      }

      // Check if barcode already exists
      const existingBarcodePackage = await this.queryBus.execute(
        new GetPackageByBarcodeQuery(addBarcodeDto.barcode)
      );

      if (existingBarcodePackage) {
        return new ApiResponseDto({
          success: false,
          message: `Barcode '${addBarcodeDto.barcode}' is already in use by another package`,
          errors: ['BARCODE_ALREADY_EXISTS']
        });
      }

      // Add the barcode
      await this.commandBus.execute(
        new AddPackageBarcodeCommand(packageId, addBarcodeDto.barcode, addBarcodeDto.addedBy)
      );

      return new ApiResponseDto({
        success: true,
        message: 'Barcode added successfully',
        data: new OperationResultDto(true, `Barcode '${addBarcodeDto.barcode}' added to package`)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to add barcode to package',
        errors: ['BARCODE_ADD_FAILED']
      });
    }
  }

  /**
   * Remove barcode from package
   */
  async removePackageBarcode(
    packageId: number, 
    removeBarcodeDto: RemovePackageBarcodeDto
  ): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify package exists and has the barcode
      const packageEntity = await this.queryBus.execute(new GetPackageByIdQuery(packageId));
      if (!packageEntity) {
        return new ApiResponseDto({
          success: false,
          message: `Package with ID ${packageId} not found`,
          errors: ['PACKAGE_NOT_FOUND']
        });
      }

      if (!packageEntity.barcodes.includes(removeBarcodeDto.barcode)) {
        return new ApiResponseDto({
          success: false,
          message: `Barcode '${removeBarcodeDto.barcode}' not found in this package`,
          errors: ['BARCODE_NOT_FOUND']
        });
      }

      // Check if this is the last barcode (business rule: package should have at least one barcode)
      if (packageEntity.barcodes.length === 1) {
        return new ApiResponseDto({
          success: false,
          message: 'Cannot remove the last barcode from package',
          errors: ['CANNOT_REMOVE_LAST_BARCODE']
        });
      }

      // Remove the barcode
      await this.commandBus.execute(
        new RemovePackageBarcodeCommand(packageId, removeBarcodeDto.barcode, removeBarcodeDto.removedBy)
      );

      return new ApiResponseDto({
        success: true,
        message: 'Barcode removed successfully',
        data: new OperationResultDto(true, `Barcode '${removeBarcodeDto.barcode}' removed from package`)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to remove barcode from package',
        errors: ['BARCODE_REMOVE_FAILED']
      });
    }
  }

  // ============================================================================
  // PACKAGE QUERY OPERATIONS
  // ============================================================================

  /**
   * Get package by ID
   */
  async getPackageById(packageId: number): Promise<ApiResponseDto<PackageResponseDto>> {
    try {
      const packageEntity = await this.queryBus.execute(new GetPackageByIdQuery(packageId));
      
      if (!packageEntity) {
        return new ApiResponseDto({
          success: false,
          message: `Package with ID ${packageId} not found`,
          errors: ['PACKAGE_NOT_FOUND']
        });
      }

      return new ApiResponseDto({
        success: true,
        data: this.mapToPackageResponse(packageEntity)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get package',
        errors: ['PACKAGE_FETCH_FAILED']
      });
    }
  }

  /**
   * Get package by code
   */
  async getPackageByCode(code: string): Promise<ApiResponseDto<PackageResponseDto>> {
    try {
      const packageEntity = await this.queryBus.execute(new GetPackageByCodeQuery(code));
      
      if (!packageEntity) {
        return new ApiResponseDto({
          success: false,
          message: `Package with code '${code}' not found`,
          errors: ['PACKAGE_NOT_FOUND']
        });
      }

      return new ApiResponseDto({
        success: true,
        data: this.mapToPackageResponse(packageEntity)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get package',
        errors: ['PACKAGE_FETCH_FAILED']
      });
    }
  }

  /**
   * Get packages with filtering and pagination
   */
  async getPackages(
    filters?: PackageFiltersDto, 
    pagination?: PaginationDto
  ): Promise<ApiResponseDto<PaginatedResult<PackageResponseDto>>> {
    try {
      const result = await this.queryBus.execute(new GetPackagesQuery(filters, pagination));
      
      const mappedResult = {
        ...result,
        data: result.data.map(pkg => this.mapToPackageResponse(pkg))
      };

      return new ApiResponseDto({
        success: true,
        data: mappedResult
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get packages',
        errors: ['PACKAGES_FETCH_FAILED']
      });
    }
  }

  /**
   * Get packages by product
   */
  async getPackagesByProduct(productId: number): Promise<ApiResponseDto<PackageResponseDto[]>> {
    try {
      const packages = await this.queryBus.execute(new GetPackagesByProductQuery(productId));
      
      const mappedPackages = packages.map(pkg => this.mapToPackageResponse(pkg));

      return new ApiResponseDto({
        success: true,
        data: mappedPackages
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get packages by product',
        errors: ['PACKAGES_BY_PRODUCT_FETCH_FAILED']
      });
    }
  }

  /**
   * Get active packages
   */
  async getActivePackages(pagination?: PaginationDto): Promise<ApiResponseDto<PaginatedResult<PackageResponseDto>>> {
    try {
      const result = await this.queryBus.execute(new GetActivePackagesQuery(pagination));
      
      const mappedResult = {
        ...result,
        data: result.data.map(pkg => this.mapToPackageResponse(pkg))
      };

      return new ApiResponseDto({
        success: true,
        data: mappedResult
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get active packages',
        errors: ['ACTIVE_PACKAGES_FETCH_FAILED']
      });
    }
  }

  /**
   * Get default package for product
   */
  async getDefaultPackage(productId: number): Promise<ApiResponseDto<PackageResponseDto>> {
    try {
      const packageEntity = await this.queryBus.execute(new GetDefaultPackageQuery(productId));
      
      if (!packageEntity) {
        return new ApiResponseDto({
          success: false,
          message: `No default package found for product ${productId}`,
          errors: ['DEFAULT_PACKAGE_NOT_FOUND']
        });
      }

      return new ApiResponseDto({
        success: true,
        data: this.mapToPackageResponse(packageEntity)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get default package',
        errors: ['DEFAULT_PACKAGE_FETCH_FAILED']
      });
    }
  }

  /**
   * Get package by barcode
   */
  async getPackageByBarcode(barcode: string): Promise<ApiResponseDto<PackageResponseDto>> {
    try {
      const packageEntity = await this.queryBus.execute(new GetPackageByBarcodeQuery(barcode));
      
      if (!packageEntity) {
        return new ApiResponseDto({
          success: false,
          message: `Package with barcode '${barcode}' not found`,
          errors: ['PACKAGE_NOT_FOUND']
        });
      }

      return new ApiResponseDto({
        success: true,
        data: this.mapToPackageResponse(packageEntity)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get package by barcode',
        errors: ['PACKAGE_BY_BARCODE_FETCH_FAILED']
      });
    }
  }

  /**
   * Get packages by barcodes (bulk operation)
   */
  async getPackagesByBarcodes(barcodes: string[]): Promise<ApiResponseDto<PackageResponseDto[]>> {
    try {
      const packages = await this.queryBus.execute(new GetPackagesByBarcodeQuery(barcodes));
      
      const mappedPackages = packages.map(pkg => this.mapToPackageResponse(pkg));

      return new ApiResponseDto({
        success: true,
        data: mappedPackages
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get packages by barcodes',
        errors: ['PACKAGES_BY_BARCODES_FETCH_FAILED']
      });
    }
  }

  /**
   * Get packages by unit of measure
   */
  async getPackagesByUnitOfMeasure(unitOfMeasure: string): Promise<ApiResponseDto<PackageResponseDto[]>> {
    try {
      const packages = await this.queryBus.execute(new GetPackagesByUnitOfMeasureQuery(unitOfMeasure));
      
      const mappedPackages = packages.map(pkg => this.mapToPackageResponse(pkg));

      return new ApiResponseDto({
        success: true,
        data: mappedPackages
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get packages by unit of measure',
        errors: ['PACKAGES_BY_UNIT_FETCH_FAILED']
      });
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Map domain Package entity to PackageResponseDto
   */
  private mapToPackageResponse(packageEntity: Package): PackageResponseDto {
    return {
      id: packageEntity.id,
      productId: packageEntity.productId,
      name: packageEntity.name,
      code: packageEntity.code,
      description: packageEntity.description,
      unitOfMeasure: packageEntity.unitOfMeasure,
      quantity: packageEntity.quantity,
      dimensions: packageEntity.dimensions,
      weight: packageEntity.weight,
      isDefault: packageEntity.isDefault,
      isActive: packageEntity.isActive,
      barcodes: packageEntity.barcodes || [],
      metadata: packageEntity.metadata || {},
      createdAt: packageEntity.createdAt,
      updatedAt: packageEntity.updatedAt,
      createdBy: packageEntity.createdBy,
      updatedBy: packageEntity.updatedBy
    } as PackageResponseDto;
  }
}
