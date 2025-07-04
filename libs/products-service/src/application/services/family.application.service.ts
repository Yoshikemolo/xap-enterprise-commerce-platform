import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

// Import Commands
import {
  CreateFamilyCommand,
  UpdateFamilyCommand,
  DeleteFamilyCommand,
  ActivateFamilyCommand,
  DeactivateFamilyCommand
} from '../commands';

// Import Queries
import {
  GetFamilyByIdQuery,
  GetFamilyByCodeQuery,
  GetFamiliesQuery,
  GetActiveFamiliesQuery,
  SearchFamiliesQuery,
  GetFamilyHierarchyQuery,
  GetSubfamiliesQuery,
  GetRootFamiliesQuery,
  PaginatedResult
} from '../queries';

// Import DTOs
import {
  CreateFamilyDto,
  UpdateFamilyDto,
  FamilyFiltersDto,
  PaginationDto,
  FamilyResponseDto,
  FamilyHierarchyResponseDto,
  ApiResponseDto,
  OperationResultDto
} from '../dto';

import { Family } from '../../domain/entities';

/**
 * Family Application Service
 * 
 * Orchestrates family-related operations for product organization.
 * Supports hierarchical family structures with subfamilies.
 * 
 * Features:
 * - Hierarchical family management
 * - Family activation/deactivation
 * - Family search and filtering
 * - Subfamily organization
 * - Business rule enforcement
 */
@Injectable()
export class FamilyApplicationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // ============================================================================
  // FAMILY CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new family with validation
   */
  async createFamily(createFamilyDto: CreateFamilyDto): Promise<ApiResponseDto<FamilyResponseDto>> {
    try {
      // Check if family code already exists
      const existingFamily = await this.queryBus.execute(
        new GetFamilyByCodeQuery(createFamilyDto.code)
      );

      if (existingFamily) {
        return new ApiResponseDto({
          success: false,
          message: `Family with code '${createFamilyDto.code}' already exists`,
          errors: ['FAMILY_CODE_ALREADY_EXISTS']
        });
      }

      // Validate parent family exists if provided
      if (createFamilyDto.parentFamilyId) {
        const parentFamily = await this.queryBus.execute(
          new GetFamilyByIdQuery(createFamilyDto.parentFamilyId)
        );

        if (!parentFamily) {
          return new ApiResponseDto({
            success: false,
            message: `Parent family with ID ${createFamilyDto.parentFamilyId} not found`,
            errors: ['PARENT_FAMILY_NOT_FOUND']
          });
        }

        if (!parentFamily.isActive) {
          return new ApiResponseDto({
            success: false,
            message: 'Cannot create subfamily under inactive parent family',
            errors: ['PARENT_FAMILY_INACTIVE']
          });
        }
      }

      // Create the family
      const family: Family = await this.commandBus.execute(
        new CreateFamilyCommand(
          createFamilyDto.name,
          createFamilyDto.code,
          createFamilyDto.description,
          createFamilyDto.parentFamilyId,
          createFamilyDto.metadata,
          createFamilyDto.sortOrder,
          createFamilyDto.createdBy
        )
      );

      return new ApiResponseDto({
        success: true,
        message: 'Family created successfully',
        data: this.mapToFamilyResponse(family)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to create family',
        errors: ['FAMILY_CREATION_FAILED']
      });
    }
  }

  /**
   * Update an existing family
   */
  async updateFamily(familyId: number, updateFamilyDto: UpdateFamilyDto): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify family exists
      const family = await this.queryBus.execute(new GetFamilyByIdQuery(familyId));
      if (!family) {
        return new ApiResponseDto({
          success: false,
          message: `Family with ID ${familyId} not found`,
          errors: ['FAMILY_NOT_FOUND']
        });
      }

      // Validate parent family if being changed
      if (updateFamilyDto.parentFamilyId !== undefined) {
        if (updateFamilyDto.parentFamilyId === familyId) {
          return new ApiResponseDto({
            success: false,
            message: 'Family cannot be its own parent',
            errors: ['INVALID_PARENT_FAMILY']
          });
        }

        if (updateFamilyDto.parentFamilyId) {
          const parentFamily = await this.queryBus.execute(
            new GetFamilyByIdQuery(updateFamilyDto.parentFamilyId)
          );

          if (!parentFamily) {
            return new ApiResponseDto({
              success: false,
              message: `Parent family with ID ${updateFamilyDto.parentFamilyId} not found`,
              errors: ['PARENT_FAMILY_NOT_FOUND']
            });
          }

          // Check for circular reference
          const wouldCreateCircle = await this.wouldCreateCircularReference(
            familyId, 
            updateFamilyDto.parentFamilyId
          );

          if (wouldCreateCircle) {
            return new ApiResponseDto({
              success: false,
              message: 'Cannot create circular family hierarchy',
              errors: ['CIRCULAR_FAMILY_REFERENCE']
            });
          }
        }
      }

      // Update the family
      await this.commandBus.execute(
        new UpdateFamilyCommand(
          familyId,
          updateFamilyDto.name,
          updateFamilyDto.description,
          updateFamilyDto.parentFamilyId,
          updateFamilyDto.metadata,
          updateFamilyDto.sortOrder,
          updateFamilyDto.updatedBy
        )
      );

      return new ApiResponseDto({
        success: true,
        message: 'Family updated successfully',
        data: new OperationResultDto(true, 'Family updated successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to update family',
        errors: ['FAMILY_UPDATE_FAILED']
      });
    }
  }

  /**
   * Delete a family
   */
  async deleteFamily(familyId: number, deletedBy?: string): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify family exists
      const family = await this.queryBus.execute(new GetFamilyByIdQuery(familyId));
      if (!family) {
        return new ApiResponseDto({
          success: false,
          message: `Family with ID ${familyId} not found`,
          errors: ['FAMILY_NOT_FOUND']
        });
      }

      // Check if family has subfamilies
      const subfamilies = await this.queryBus.execute(new GetSubfamiliesQuery(familyId));
      if (subfamilies.length > 0) {
        return new ApiResponseDto({
          success: false,
          message: 'Cannot delete family with existing subfamilies',
          errors: ['FAMILY_HAS_SUBFAMILIES']
        });
      }

      // Check if family has products (this would be checked via ProductRepository)
      // For now, we'll assume this check is done at the domain level

      // Delete the family
      await this.commandBus.execute(new DeleteFamilyCommand(familyId, deletedBy));

      return new ApiResponseDto({
        success: true,
        message: 'Family deleted successfully',
        data: new OperationResultDto(true, 'Family deleted successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to delete family',
        errors: ['FAMILY_DELETE_FAILED']
      });
    }
  }

  // ============================================================================
  // FAMILY LIFECYCLE OPERATIONS
  // ============================================================================

  /**
   * Activate a family
   */
  async activateFamily(familyId: number, activatedBy?: string): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      await this.commandBus.execute(new ActivateFamilyCommand(familyId, activatedBy));
      
      return new ApiResponseDto({
        success: true,
        message: 'Family activated successfully',
        data: new OperationResultDto(true, 'Family activated successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to activate family',
        errors: ['FAMILY_ACTIVATION_FAILED']
      });
    }
  }

  /**
   * Deactivate a family
   */
  async deactivateFamily(familyId: number, deactivatedBy?: string): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Check if family has active subfamilies
      const subfamilies = await this.queryBus.execute(new GetSubfamiliesQuery(familyId));
      const activeSubfamilies = subfamilies.filter(subfamily => subfamily.isActive);
      
      if (activeSubfamilies.length > 0) {
        return new ApiResponseDto({
          success: false,
          message: 'Cannot deactivate family with active subfamilies',
          errors: ['FAMILY_HAS_ACTIVE_SUBFAMILIES']
        });
      }

      await this.commandBus.execute(new DeactivateFamilyCommand(familyId, deactivatedBy));
      
      return new ApiResponseDto({
        success: true,
        message: 'Family deactivated successfully',
        data: new OperationResultDto(true, 'Family deactivated successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to deactivate family',
        errors: ['FAMILY_DEACTIVATION_FAILED']
      });
    }
  }

  // ============================================================================
  // FAMILY QUERY OPERATIONS
  // ============================================================================

  /**
   * Get family by ID
   */
  async getFamilyById(familyId: number): Promise<ApiResponseDto<FamilyResponseDto>> {
    try {
      const family = await this.queryBus.execute(new GetFamilyByIdQuery(familyId));
      
      if (!family) {
        return new ApiResponseDto({
          success: false,
          message: `Family with ID ${familyId} not found`,
          errors: ['FAMILY_NOT_FOUND']
        });
      }

      return new ApiResponseDto({
        success: true,
        data: this.mapToFamilyResponse(family)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get family',
        errors: ['FAMILY_FETCH_FAILED']
      });
    }
  }

  /**
   * Get family by code
   */
  async getFamilyByCode(code: string): Promise<ApiResponseDto<FamilyResponseDto>> {
    try {
      const family = await this.queryBus.execute(new GetFamilyByCodeQuery(code));
      
      if (!family) {
        return new ApiResponseDto({
          success: false,
          message: `Family with code '${code}' not found`,
          errors: ['FAMILY_NOT_FOUND']
        });
      }

      return new ApiResponseDto({
        success: true,
        data: this.mapToFamilyResponse(family)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get family',
        errors: ['FAMILY_FETCH_FAILED']
      });
    }
  }

  /**
   * Get families with filtering and pagination
   */
  async getFamilies(
    filters?: FamilyFiltersDto, 
    pagination?: PaginationDto
  ): Promise<ApiResponseDto<PaginatedResult<FamilyResponseDto>>> {
    try {
      const result = await this.queryBus.execute(new GetFamiliesQuery(filters, pagination));
      
      const mappedResult = {
        ...result,
        data: result.data.map(family => this.mapToFamilyResponse(family))
      };

      return new ApiResponseDto({
        success: true,
        data: mappedResult
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get families',
        errors: ['FAMILIES_FETCH_FAILED']
      });
    }
  }

  /**
   * Search families
   */
  async searchFamilies(
    searchTerm: string,
    pagination?: PaginationDto
  ): Promise<ApiResponseDto<PaginatedResult<FamilyResponseDto>>> {
    try {
      const result = await this.queryBus.execute(
        new SearchFamiliesQuery(searchTerm, pagination)
      );
      
      const mappedResult = {
        ...result,
        data: result.data.map(family => this.mapToFamilyResponse(family))
      };

      return new ApiResponseDto({
        success: true,
        data: mappedResult
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to search families',
        errors: ['FAMILY_SEARCH_FAILED']
      });
    }
  }

  /**
   * Get active families
   */
  async getActiveFamilies(pagination?: PaginationDto): Promise<ApiResponseDto<PaginatedResult<FamilyResponseDto>>> {
    try {
      const result = await this.queryBus.execute(new GetActiveFamiliesQuery(pagination));
      
      const mappedResult = {
        ...result,
        data: result.data.map(family => this.mapToFamilyResponse(family))
      };

      return new ApiResponseDto({
        success: true,
        data: mappedResult
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get active families',
        errors: ['ACTIVE_FAMILIES_FETCH_FAILED']
      });
    }
  }

  /**
   * Get family hierarchy
   */
  async getFamilyHierarchy(familyId?: number): Promise<ApiResponseDto<FamilyHierarchyResponseDto | FamilyHierarchyResponseDto[]>> {
    try {
      const hierarchy = await this.queryBus.execute(new GetFamilyHierarchyQuery(familyId));

      return new ApiResponseDto({
        success: true,
        data: hierarchy
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get family hierarchy',
        errors: ['FAMILY_HIERARCHY_FETCH_FAILED']
      });
    }
  }

  /**
   * Get subfamilies
   */
  async getSubfamilies(parentFamilyId: number): Promise<ApiResponseDto<FamilyResponseDto[]>> {
    try {
      const subfamilies = await this.queryBus.execute(new GetSubfamiliesQuery(parentFamilyId));
      
      const mappedSubfamilies = subfamilies.map(family => this.mapToFamilyResponse(family));

      return new ApiResponseDto({
        success: true,
        data: mappedSubfamilies
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get subfamilies',
        errors: ['SUBFAMILIES_FETCH_FAILED']
      });
    }
  }

  /**
   * Get root families (families without parent)
   */
  async getRootFamilies(pagination?: PaginationDto): Promise<ApiResponseDto<PaginatedResult<FamilyResponseDto>>> {
    try {
      const result = await this.queryBus.execute(new GetRootFamiliesQuery(pagination));
      
      const mappedResult = {
        ...result,
        data: result.data.map(family => this.mapToFamilyResponse(family))
      };

      return new ApiResponseDto({
        success: true,
        data: mappedResult
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get root families',
        errors: ['ROOT_FAMILIES_FETCH_FAILED']
      });
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Check if setting parentFamilyId would create a circular reference
   */
  private async wouldCreateCircularReference(familyId: number, parentFamilyId: number): Promise<boolean> {
    let currentParentId = parentFamilyId;
    const visitedIds = new Set<number>();
    
    while (currentParentId) {
      if (currentParentId === familyId) {
        return true; // Circular reference detected
      }
      
      if (visitedIds.has(currentParentId)) {
        return true; // Already visited, circular reference
      }
      
      visitedIds.add(currentParentId);
      
      const parentFamily = await this.queryBus.execute(new GetFamilyByIdQuery(currentParentId));
      currentParentId = parentFamily?.parentFamilyId || null;
    }
    
    return false;
  }

  /**
   * Map domain Family entity to FamilyResponseDto
   */
  private mapToFamilyResponse(family: Family): FamilyResponseDto {
    return {
      id: family.id,
      name: family.name,
      code: family.code,
      description: family.description,
      parentFamilyId: family.parentFamilyId,
      isActive: family.isActive,
      metadata: family.metadata || {},
      sortOrder: family.sortOrder,
      createdAt: family.createdAt,
      updatedAt: family.updatedAt,
      // Note: createdBy and updatedBy are not available in the domain entity
      // These would need to be added to the domain model if required
      // createdBy: family.createdBy,
      // updatedBy: family.updatedBy
    } as FamilyResponseDto;
  }
}
