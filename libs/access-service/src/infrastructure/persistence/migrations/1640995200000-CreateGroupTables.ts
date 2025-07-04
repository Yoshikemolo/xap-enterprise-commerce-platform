import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class CreateGroupTables1640995200000 implements MigrationInterface {
  name = 'CreateGroupTables1640995200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create groups table with tree structure support
    await queryRunner.createTable(
      new Table({
        name: 'groups',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'uuid',
            type: 'varchar',
            length: '36',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'parentId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
          },
        ],
      }),
      true
    );

    // Create closure table for hierarchical queries
    await queryRunner.createTable(
      new Table({
        name: 'groups_closure',
        columns: [
          {
            name: 'id_ancestor',
            type: 'int',
          },
          {
            name: 'id_descendant',
            type: 'int',
          },
        ],
      }),
      true
    );

    // Create user_groups join table
    await queryRunner.createTable(
      new Table({
        name: 'user_groups',
        columns: [
          {
            name: 'user_id',
            type: 'int',
          },
          {
            name: 'group_id',
            type: 'int',
          },
        ],
      }),
      true
    );

    // Create group_permissions join table
    await queryRunner.createTable(
      new Table({
        name: 'group_permissions',
        columns: [
          {
            name: 'group_id',
            type: 'int',
          },
          {
            name: 'permission_id',
            type: 'int',
          },
        ],
      }),
      true
    );

    // Create indexes
    await queryRunner.createIndex(
      'groups',
      new Index('IDX_GROUPS_NAME', ['name'], { unique: true })
    );

    await queryRunner.createIndex(
      'groups',
      new Index('IDX_GROUPS_PARENT_ID', ['parentId'])
    );

    await queryRunner.createIndex(
      'groups',
      new Index('IDX_GROUPS_UUID', ['uuid'], { unique: true })
    );

    await queryRunner.createIndex(
      'groups',
      new Index('IDX_GROUPS_ACTIVE', ['isActive'])
    );

    await queryRunner.createIndex(
      'groups_closure',
      new Index('IDX_GROUPS_CLOSURE_ANCESTOR', ['id_ancestor'])
    );

    await queryRunner.createIndex(
      'groups_closure',
      new Index('IDX_GROUPS_CLOSURE_DESCENDANT', ['id_descendant'])
    );

    await queryRunner.createIndex(
      'user_groups',
      new Index('IDX_USER_GROUPS_USER', ['user_id'])
    );

    await queryRunner.createIndex(
      'user_groups',
      new Index('IDX_USER_GROUPS_GROUP', ['group_id'])
    );

    await queryRunner.createIndex(
      'user_groups',
      new Index('IDX_USER_GROUPS_UNIQUE', ['user_id', 'group_id'], { unique: true })
    );

    await queryRunner.createIndex(
      'group_permissions',
      new Index('IDX_GROUP_PERMISSIONS_GROUP', ['group_id'])
    );

    await queryRunner.createIndex(
      'group_permissions',
      new Index('IDX_GROUP_PERMISSIONS_PERMISSION', ['permission_id'])
    );

    await queryRunner.createIndex(
      'group_permissions',
      new Index('IDX_GROUP_PERMISSIONS_UNIQUE', ['group_id', 'permission_id'], { unique: true })
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'groups',
      new ForeignKey({
        columnNames: ['parentId'],
        referencedTableName: 'groups',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'groups_closure',
      new ForeignKey({
        columnNames: ['id_ancestor'],
        referencedTableName: 'groups',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'groups_closure',
      new ForeignKey({
        columnNames: ['id_descendant'],
        referencedTableName: 'groups',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'user_groups',
      new ForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'user_groups',
      new ForeignKey({
        columnNames: ['group_id'],
        referencedTableName: 'groups',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'group_permissions',
      new ForeignKey({
        columnNames: ['group_id'],
        referencedTableName: 'groups',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'group_permissions',
      new ForeignKey({
        columnNames: ['permission_id'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    // Insert default group
    await queryRunner.query(`
      INSERT INTO groups (uuid, name, description, isActive, parentId, createdAt, updatedAt, version)
      VALUES (
        UUID(),
        'DefaultGroup',
        'Default group for all users',
        true,
        NULL,
        NOW(),
        NOW(),
        1
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const groupsTable = await queryRunner.getTable('groups');
    const groupsClosureTable = await queryRunner.getTable('groups_closure');
    const userGroupsTable = await queryRunner.getTable('user_groups');
    const groupPermissionsTable = await queryRunner.getTable('group_permissions');

    if (groupsTable) {
      const groupsParentForeignKey = groupsTable.foreignKeys.find(fk => fk.columnNames.indexOf('parentId') !== -1);
      if (groupsParentForeignKey) {
        await queryRunner.dropForeignKey('groups', groupsParentForeignKey);
      }
    }

    if (groupsClosureTable) {
      const ancestorForeignKey = groupsClosureTable.foreignKeys.find(fk => fk.columnNames.indexOf('id_ancestor') !== -1);
      const descendantForeignKey = groupsClosureTable.foreignKeys.find(fk => fk.columnNames.indexOf('id_descendant') !== -1);
      
      if (ancestorForeignKey) {
        await queryRunner.dropForeignKey('groups_closure', ancestorForeignKey);
      }
      if (descendantForeignKey) {
        await queryRunner.dropForeignKey('groups_closure', descendantForeignKey);
      }
    }

    if (userGroupsTable) {
      const userForeignKey = userGroupsTable.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1);
      const groupForeignKey = userGroupsTable.foreignKeys.find(fk => fk.columnNames.indexOf('group_id') !== -1);
      
      if (userForeignKey) {
        await queryRunner.dropForeignKey('user_groups', userForeignKey);
      }
      if (groupForeignKey) {
        await queryRunner.dropForeignKey('user_groups', groupForeignKey);
      }
    }

    if (groupPermissionsTable) {
      const groupForeignKey = groupPermissionsTable.foreignKeys.find(fk => fk.columnNames.indexOf('group_id') !== -1);
      const permissionForeignKey = groupPermissionsTable.foreignKeys.find(fk => fk.columnNames.indexOf('permission_id') !== -1);
      
      if (groupForeignKey) {
        await queryRunner.dropForeignKey('group_permissions', groupForeignKey);
      }
      if (permissionForeignKey) {
        await queryRunner.dropForeignKey('group_permissions', permissionForeignKey);
      }
    }

    // Drop tables
    await queryRunner.dropTable('group_permissions', true);
    await queryRunner.dropTable('user_groups', true);
    await queryRunner.dropTable('groups_closure', true);
    await queryRunner.dropTable('groups', true);
  }
}
