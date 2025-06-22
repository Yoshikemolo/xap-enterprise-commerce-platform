import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class CreateProductsServiceTables1687420000000 implements MigrationInterface {
  name = 'CreateProductsServiceTables1687420000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create families table first (no foreign key dependencies)
    await queryRunner.createTable(
      new Table({
        name: 'families',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '20',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'parent_family_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'sort_order',
            type: 'int',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Create products table
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'product_code',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'family_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'specifications',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'media',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Create stocks table
    await queryRunner.createTable(
      new Table({
        name: 'stocks',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'product_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'product_code',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'location_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'total_quantity',
            type: 'decimal',
            precision: 15,
            scale: 4,
            default: 0,
          },
          {
            name: 'available_quantity',
            type: 'decimal',
            precision: 15,
            scale: 4,
            default: 0,
          },
          {
            name: 'reserved_quantity',
            type: 'decimal',
            precision: 15,
            scale: 4,
            default: 0,
          },
          {
            name: 'minimum_level',
            type: 'decimal',
            precision: 15,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'maximum_level',
            type: 'decimal',
            precision: 15,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'reorder_point',
            type: 'decimal',
            precision: 15,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'batches',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Create stock_movements table
    await queryRunner.createTable(
      new Table({
        name: 'stock_movements',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'stock_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'batch_number',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'movement_type',
            type: 'enum',
            enum: ['IN', 'OUT', 'RESERVE', 'RELEASE', 'ADJUST', 'EXPIRE', 'TRANSFER'],
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 15,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'previous_quantity',
            type: 'decimal',
            precision: 15,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'new_quantity',
            type: 'decimal',
            precision: 15,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'order_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'reason',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Create packages table
    await queryRunner.createTable(
      new Table({
        name: 'packages',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'product_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '30',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'unit_of_measure',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 15,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'dimensions',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'weight',
            type: 'decimal',
            precision: 10,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'barcodes',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Create families closure table for hierarchical queries
    await queryRunner.createTable(
      new Table({
        name: 'families_closure',
        columns: [
          {
            name: 'id_ancestor',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'id_descendant',
            type: 'int',
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create indices for families
    await queryRunner.createIndex('families', new Index('IDX_FAMILIES_CODE', ['code'], { isUnique: true }));
    await queryRunner.createIndex('families', new Index('IDX_FAMILIES_PARENT_ID', ['parent_family_id']));
    await queryRunner.createIndex('families', new Index('IDX_FAMILIES_ACTIVE', ['is_active']));
    await queryRunner.createIndex('families', new Index('IDX_FAMILIES_SORT', ['sort_order']));

    // Create indices for products
    await queryRunner.createIndex('products', new Index('IDX_PRODUCTS_CODE', ['product_code'], { isUnique: true }));
    await queryRunner.createIndex('products', new Index('IDX_PRODUCTS_FAMILY_ID', ['family_id']));
    await queryRunner.createIndex('products', new Index('IDX_PRODUCTS_ACTIVE', ['is_active']));
    await queryRunner.createIndex('products', new Index('IDX_PRODUCTS_CREATED_AT', ['created_at']));

    // Create indices for stocks
    await queryRunner.createIndex('stocks', new Index('IDX_STOCKS_PRODUCT_LOCATION', ['product_id', 'location_id'], { isUnique: true }));
    await queryRunner.createIndex('stocks', new Index('IDX_STOCKS_PRODUCT_CODE', ['product_code']));
    await queryRunner.createIndex('stocks', new Index('IDX_STOCKS_LOCATION', ['location_id']));
    await queryRunner.createIndex('stocks', new Index('IDX_STOCKS_ACTIVE', ['is_active']));
    await queryRunner.createIndex('stocks', new Index('IDX_STOCKS_TOTAL_QTY', ['total_quantity']));
    await queryRunner.createIndex('stocks', new Index('IDX_STOCKS_AVAILABLE_QTY', ['available_quantity']));

    // Create indices for stock_movements
    await queryRunner.createIndex('stock_movements', new Index('IDX_MOVEMENTS_STOCK_ID', ['stock_id']));
    await queryRunner.createIndex('stock_movements', new Index('IDX_MOVEMENTS_BATCH', ['batch_number']));
    await queryRunner.createIndex('stock_movements', new Index('IDX_MOVEMENTS_TYPE', ['movement_type']));
    await queryRunner.createIndex('stock_movements', new Index('IDX_MOVEMENTS_ORDER', ['order_id']));
    await queryRunner.createIndex('stock_movements', new Index('IDX_MOVEMENTS_CREATED_AT', ['created_at']));

    // Create indices for packages
    await queryRunner.createIndex('packages', new Index('IDX_PACKAGES_PRODUCT_ID', ['product_id']));
    await queryRunner.createIndex('packages', new Index('IDX_PACKAGES_CODE', ['code'], { isUnique: true }));
    await queryRunner.createIndex('packages', new Index('IDX_PACKAGES_DEFAULT', ['is_default']));
    await queryRunner.createIndex('packages', new Index('IDX_PACKAGES_ACTIVE', ['is_active']));
    await queryRunner.createIndex('packages', new Index('IDX_PACKAGES_UOM', ['unit_of_measure']));

    // Create indices for families_closure
    await queryRunner.createIndex('families_closure', new Index('IDX_CLOSURE_ANCESTOR', ['id_ancestor']));
    await queryRunner.createIndex('families_closure', new Index('IDX_CLOSURE_DESCENDANT', ['id_descendant']));

    // Create foreign key constraints
    await queryRunner.createForeignKey(
      'families',
      new ForeignKey({
        columnNames: ['parent_family_id'],
        referencedTableName: 'families',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'products',
      new ForeignKey({
        columnNames: ['family_id'],
        referencedTableName: 'families',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'stocks',
      new ForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'stock_movements',
      new ForeignKey({
        columnNames: ['stock_id'],
        referencedTableName: 'stocks',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'packages',
      new ForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'families_closure',
      new ForeignKey({
        columnNames: ['id_ancestor'],
        referencedTableName: 'families',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'families_closure',
      new ForeignKey({
        columnNames: ['id_descendant'],
        referencedTableName: 'families',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const familiesTable = await queryRunner.getTable('families');
    const productsTable = await queryRunner.getTable('products');
    const stocksTable = await queryRunner.getTable('stocks');
    const movementsTable = await queryRunner.getTable('stock_movements');
    const packagesTable = await queryRunner.getTable('packages');
    const closureTable = await queryRunner.getTable('families_closure');

    // Drop foreign keys
    if (familiesTable) {
      const parentForeignKey = familiesTable.foreignKeys.find(fk => fk.columnNames.indexOf('parent_family_id') !== -1);
      if (parentForeignKey) await queryRunner.dropForeignKey('families', parentForeignKey);
    }

    if (productsTable) {
      const familyForeignKey = productsTable.foreignKeys.find(fk => fk.columnNames.indexOf('family_id') !== -1);
      if (familyForeignKey) await queryRunner.dropForeignKey('products', familyForeignKey);
    }

    if (stocksTable) {
      const productForeignKey = stocksTable.foreignKeys.find(fk => fk.columnNames.indexOf('product_id') !== -1);
      if (productForeignKey) await queryRunner.dropForeignKey('stocks', productForeignKey);
    }

    if (movementsTable) {
      const stockForeignKey = movementsTable.foreignKeys.find(fk => fk.columnNames.indexOf('stock_id') !== -1);
      if (stockForeignKey) await queryRunner.dropForeignKey('stock_movements', stockForeignKey);
    }

    if (packagesTable) {
      const productForeignKey = packagesTable.foreignKeys.find(fk => fk.columnNames.indexOf('product_id') !== -1);
      if (productForeignKey) await queryRunner.dropForeignKey('packages', productForeignKey);
    }

    if (closureTable) {
      const ancestorForeignKey = closureTable.foreignKeys.find(fk => fk.columnNames.indexOf('id_ancestor') !== -1);
      const descendantForeignKey = closureTable.foreignKeys.find(fk => fk.columnNames.indexOf('id_descendant') !== -1);
      if (ancestorForeignKey) await queryRunner.dropForeignKey('families_closure', ancestorForeignKey);
      if (descendantForeignKey) await queryRunner.dropForeignKey('families_closure', descendantForeignKey);
    }

    // Drop tables in reverse dependency order
    await queryRunner.dropTable('families_closure');
    await queryRunner.dropTable('packages');
    await queryRunner.dropTable('stock_movements');
    await queryRunner.dropTable('stocks');
    await queryRunner.dropTable('products');
    await queryRunner.dropTable('families');
  }
}
