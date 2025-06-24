import { Module } from '@nestjs/common';
import { TestProductsController } from './test-products.controller';
import { TestStockController } from './test-stock.controller';

/**
 * Simplified Products Testing Module
 * 
 * Basic controllers to test API endpoints without complex dependencies
 */
@Module({
  controllers: [
    TestProductsController,
    TestStockController,
  ],
  providers: [],
  exports: [],
})
export class ProductsTestingModule {}
