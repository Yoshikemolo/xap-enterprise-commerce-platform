import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { 
  GroupRepository,
  GroupReadModel,
  GroupDto,
  GroupHierarchyDto,
  GroupTreeDto,
  UserDto,
  PermissionDto
} from '../../domain/repositories';
import { QueryFilter, QueryOptions, PaginatedResponse } from '@enterprise/shared';
import { NotFoundError } from '@enterprise/shared';

// Group Queries
export class GetGroupByIdQuery implements IQuery {
  constructor(public readonly groupId: string) {}
}

export class GetGroupByNameQuery implements IQuery {
  constructor(public readonly name: string) {}
}

export class GetGroupsQuery implements IQuery {
  constructor(
    public readonly filter?: QueryFilter,
    public readonly options?: QueryOptions
  ) {}
}

export class GetRootGroupsQuery implements IQuery {
  constructor(public readonly options?: QueryOptions) {}
}

export class GetGroupChildrenQuery implements IQuery {
  constructor(
    public readonly groupId: string,
    public readonly options?: QueryOptions
  ) {}
}

export class GetGroupAncestorsQuery implements IQuery {
  constructor(public readonly groupId: string) {}
}

export class GetGroupDescendantsQuery implements IQuery {
  constructor(public readonly groupId: string) {}
}

export class GetGroupUsersQuery implements IQuery {
  constructor(
    public readonly groupId: string,
    public readonly options?: QueryOptions
  ) {}
}

export class GetUserGroupsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly options?: QueryOptions
  ) {}
}

export class GetGroupPermissionsQuery implements IQuery {
  constructor(
    public readonly groupId: string,
    public readonly includeInherited?: boolean
  ) {}
}

export class GetGroupsByPermissionQuery implements IQuery {
  constructor(
    public readonly permissionName: string,
    public readonly options?: QueryOptions
  ) {}
}

export class SearchGroupsQuery implements IQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly options?: QueryOptions
  ) {}
}

export class GetActiveGroupsQuery implements IQuery {
  constructor(public readonly options?: QueryOptions) {}
}

export class GetDefaultGroupQuery implements IQuery {
  constructor() {}
}

export class GetGroupHierarchyQuery implements IQuery {
  constructor(public readonly rootGroupId?: string) {}
}

export class GetGroupTreeQuery implements IQuery {
  constructor(public readonly rootGroupId?: string) {}
}

export class GetGroupStatisticsQuery implements IQuery {
  constructor(public readonly groupId?: string) {}
}

export class CheckGroupHierarchyQuery implements IQuery {
  constructor(
    public readonly groupId: string,
    public readonly parentId: string
  ) {}
}

export class GetGroupPathQuery implements IQuery {
  constructor(public readonly groupId: string) {}
}

// Query Response Types
export interface GroupStatisticsDto {
  totalGroups: number;
  activeGroups: number;
  inactiveGroups: number;
  rootGroups: number;
  groupsWithUsers: number;
  groupsWithPermissions: number;
  averageUsersPerGroup: number;
  averagePermissionsPerGroup: number;
  maxDepthLevel: number;
  groupsByLevel: Record<number, number>;
}

export interface GroupPathDto {
  groupId: string;
  groupName: string;
  path: string;
  level: number;
  ancestors: Array<{
    id: string;
    name: string;
  }>;
}

// Query Handlers
@QueryHandler(GetGroupByIdQuery)
@Injectable()
export class GetGroupByIdQueryHandler implements IQueryHandler<GetGroupByIdQuery, GroupDto | null> {
  constructor(private readonly groupReadModel: GroupReadModel) {}

  async execute(query: GetGroupByIdQuery): Promise<GroupDto | null> {
    return await this.groupReadModel.findById(query.groupId);
  }
}

@QueryHandler(GetGroupByNameQuery)
@Injectable()
export class GetGroupByNameQueryHandler implements IQueryHandler<GetGroupByNameQuery, GroupDto | null> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetGroupByNameQuery): Promise<GroupDto | null> {
    const group = await this.groupRepository.findByName(query.name);
    return group ? group.toPlainObject() : null;
  }
}

@QueryHandler(GetGroupsQuery)
@Injectable()
export class GetGroupsQueryHandler implements IQueryHandler<GetGroupsQuery, PaginatedResponse<GroupDto>> {
  constructor(private readonly groupReadModel: GroupReadModel) {}

  async execute(query: GetGroupsQuery): Promise<PaginatedResponse<GroupDto>> {
    const groups = await this.groupReadModel.findMany(query.filter || {});
    const total = await this.groupReadModel.count(query.filter || {});

    // Apply pagination if specified
    let paginatedGroups = groups;
    if (query.options?.take) {
      const skip = query.options.skip || 0;
      paginatedGroups = groups.slice(skip, skip + query.options.take);
    }

    return {
      success: true,
      data: paginatedGroups,
      pagination: {
        page: Math.floor((query.options?.skip || 0) / (query.options?.take || 10)) + 1,
        limit: query.options?.take || 10,
        total,
        pages: Math.ceil(total / (query.options?.take || 10)),
        hasNext: (query.options?.skip || 0) + (query.options?.take || 10) < total,
        hasPrev: (query.options?.skip || 0) > 0,
      }
    };
  }
}

@QueryHandler(GetRootGroupsQuery)
@Injectable()
export class GetRootGroupsQueryHandler implements IQueryHandler<GetRootGroupsQuery, GroupDto[]> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetRootGroupsQuery): Promise<GroupDto[]> {
    const groups = await this.groupRepository.findRootGroups();
    return groups.map(group => group.toPlainObject());
  }
}

@QueryHandler(GetGroupChildrenQuery)
@Injectable()
export class GetGroupChildrenQueryHandler implements IQueryHandler<GetGroupChildrenQuery, GroupDto[]> {
  constructor(private readonly groupReadModel: GroupReadModel) {}

  async execute(query: GetGroupChildrenQuery): Promise<GroupDto[]> {
    return await this.groupReadModel.findGroupChildren(query.groupId);
  }
}

@QueryHandler(GetGroupAncestorsQuery)
@Injectable()
export class GetGroupAncestorsQueryHandler implements IQueryHandler<GetGroupAncestorsQuery, GroupDto[]> {
  constructor(private readonly groupReadModel: GroupReadModel) {}

  async execute(query: GetGroupAncestorsQuery): Promise<GroupDto[]> {
    return await this.groupReadModel.findGroupAncestors(query.groupId);
  }
}

@QueryHandler(GetGroupDescendantsQuery)
@Injectable()
export class GetGroupDescendantsQueryHandler implements IQueryHandler<GetGroupDescendantsQuery, GroupDto[]> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetGroupDescendantsQuery): Promise<GroupDto[]> {
    const groups = await this.groupRepository.findDescendants(query.groupId);
    return groups.map(group => group.toPlainObject());
  }
}

@QueryHandler(GetGroupUsersQuery)
@Injectable()
export class GetGroupUsersQueryHandler implements IQueryHandler<GetGroupUsersQuery, UserDto[]> {
  constructor(private readonly groupReadModel: GroupReadModel) {}

  async execute(query: GetGroupUsersQuery): Promise<UserDto[]> {
    return await this.groupReadModel.findGroupUsers(query.groupId, query.options);
  }
}

@QueryHandler(GetUserGroupsQuery)
@Injectable()
export class GetUserGroupsQueryHandler implements IQueryHandler<GetUserGroupsQuery, GroupDto[]> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetUserGroupsQuery): Promise<GroupDto[]> {
    const groups = await this.groupRepository.findUserGroups(query.userId);
    return groups.map(group => group.toPlainObject());
  }
}

@QueryHandler(GetGroupPermissionsQuery)
@Injectable()
export class GetGroupPermissionsQueryHandler implements IQueryHandler<GetGroupPermissionsQuery, PermissionDto[]> {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly groupReadModel: GroupReadModel
  ) {}

  async execute(query: GetGroupPermissionsQuery): Promise<PermissionDto[]> {
    if (query.includeInherited) {
      const group = await this.groupRepository.findWithPermissions(query.groupId);
      if (!group) {
        throw new NotFoundError('Group', query.groupId);
      }
      return group.getAllPermissionsIncludingInherited().map(p => p.toPlainObject());
    } else {
      const permissions = await this.groupReadModel.findGroupPermissions(query.groupId);
      return permissions.map(name => ({ name }) as PermissionDto);
    }
  }
}

@QueryHandler(GetGroupsByPermissionQuery)
@Injectable()
export class GetGroupsByPermissionQueryHandler implements IQueryHandler<GetGroupsByPermissionQuery, GroupDto[]> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetGroupsByPermissionQuery): Promise<GroupDto[]> {
    const groups = await this.groupRepository.findByPermissionName(query.permissionName);
    return groups.map(group => group.toPlainObject());
  }
}

@QueryHandler(SearchGroupsQuery)
@Injectable()
export class SearchGroupsQueryHandler implements IQueryHandler<SearchGroupsQuery, GroupDto[]> {
  constructor(private readonly groupReadModel: GroupReadModel) {}

  async execute(query: SearchGroupsQuery): Promise<GroupDto[]> {
    return await this.groupReadModel.searchGroups(query.searchTerm, query.options);
  }
}

@QueryHandler(GetActiveGroupsQuery)
@Injectable()
export class GetActiveGroupsQueryHandler implements IQueryHandler<GetActiveGroupsQuery, GroupDto[]> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetActiveGroupsQuery): Promise<GroupDto[]> {
    const groups = await this.groupRepository.findActiveGroups();
    return groups.map(group => group.toPlainObject());
  }
}

@QueryHandler(GetDefaultGroupQuery)
@Injectable()
export class GetDefaultGroupQueryHandler implements IQueryHandler<GetDefaultGroupQuery, GroupDto> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetDefaultGroupQuery): Promise<GroupDto> {
    const group = await this.groupRepository.findDefaultGroup();
    return group.toPlainObject();
  }
}

@QueryHandler(GetGroupHierarchyQuery)
@Injectable()
export class GetGroupHierarchyQueryHandler implements IQueryHandler<GetGroupHierarchyQuery, GroupHierarchyDto[]> {
  constructor(private readonly groupReadModel: GroupReadModel) {}

  async execute(query: GetGroupHierarchyQuery): Promise<GroupHierarchyDto[]> {
    return await this.groupReadModel.getGroupHierarchy();
  }
}

@QueryHandler(GetGroupTreeQuery)
@Injectable()
export class GetGroupTreeQueryHandler implements IQueryHandler<GetGroupTreeQuery, GroupTreeDto[]> {
  constructor(private readonly groupReadModel: GroupReadModel) {}

  async execute(query: GetGroupTreeQuery): Promise<GroupTreeDto[]> {
    return await this.groupReadModel.getGroupTree();
  }
}

@QueryHandler(GetGroupStatisticsQuery)
@Injectable()
export class GetGroupStatisticsQueryHandler implements IQueryHandler<GetGroupStatisticsQuery, GroupStatisticsDto> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetGroupStatisticsQuery): Promise<GroupStatisticsDto> {
    // This would typically be implemented with specialized queries for performance
    const allGroups = await this.groupRepository.findActiveGroups();
    
    const totalGroups = allGroups.length;
    const activeGroups = allGroups.filter(g => g.isActive).length;
    const inactiveGroups = totalGroups - activeGroups;
    const rootGroups = allGroups.filter(g => g.isRootGroup).length;
    const groupsWithUsers = allGroups.filter(g => g.hasUsers).length;
    const groupsWithPermissions = allGroups.filter(g => g.hasPermissions).length;
    
    const totalUsers = allGroups.reduce((sum, g) => sum + g.users.length, 0);
    const totalPermissions = allGroups.reduce((sum, g) => sum + g.permissions.length, 0);
    
    const averageUsersPerGroup = totalGroups > 0 ? totalUsers / totalGroups : 0;
    const averagePermissionsPerGroup = totalGroups > 0 ? totalPermissions / totalGroups : 0;
    
    const levels = allGroups.map(g => g.getLevel());
    const maxDepthLevel = levels.length > 0 ? Math.max(...levels) : 0;
    
    const groupsByLevel: Record<number, number> = {};
    levels.forEach(level => {
      groupsByLevel[level] = (groupsByLevel[level] || 0) + 1;
    });

    return {
      totalGroups,
      activeGroups,
      inactiveGroups,
      rootGroups,
      groupsWithUsers,
      groupsWithPermissions,
      averageUsersPerGroup: Math.round(averageUsersPerGroup * 100) / 100,
      averagePermissionsPerGroup: Math.round(averagePermissionsPerGroup * 100) / 100,
      maxDepthLevel,
      groupsByLevel
    };
  }
}

@QueryHandler(CheckGroupHierarchyQuery)
@Injectable()
export class CheckGroupHierarchyQueryHandler implements IQueryHandler<CheckGroupHierarchyQuery, boolean> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: CheckGroupHierarchyQuery): Promise<boolean> {
    return await this.groupRepository.validateGroupHierarchy(query.groupId, query.parentId);
  }
}

@QueryHandler(GetGroupPathQuery)
@Injectable()
export class GetGroupPathQueryHandler implements IQueryHandler<GetGroupPathQuery, GroupPathDto> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetGroupPathQuery): Promise<GroupPathDto> {
    const group = await this.groupRepository.findById(query.groupId);
    if (!group) {
      throw new NotFoundError('Group', query.groupId);
    }

    const ancestors = group.getAllAncestors();
    
    return {
      groupId: group.id,
      groupName: group.name,
      path: group.getPath(),
      level: group.getLevel(),
      ancestors: ancestors.map(ancestor => ({
        id: ancestor.id,
        name: ancestor.name
      }))
    };
  }
}

// Export all Group query handlers
export const GroupQueryHandlers = [
  GetGroupByIdQueryHandler,
  GetGroupByNameQueryHandler,
  GetGroupsQueryHandler,
  GetRootGroupsQueryHandler,
  GetGroupChildrenQueryHandler,
  GetGroupAncestorsQueryHandler,
  GetGroupDescendantsQueryHandler,
  GetGroupUsersQueryHandler,
  GetUserGroupsQueryHandler,
  GetGroupPermissionsQueryHandler,
  GetGroupsByPermissionQueryHandler,
  SearchGroupsQueryHandler,
  GetActiveGroupsQueryHandler,
  GetDefaultGroupQueryHandler,
  GetGroupHierarchyQueryHandler,
  GetGroupTreeQueryHandler,
  GetGroupStatisticsQueryHandler,
  CheckGroupHierarchyQueryHandler,
  GetGroupPathQueryHandler,
];
