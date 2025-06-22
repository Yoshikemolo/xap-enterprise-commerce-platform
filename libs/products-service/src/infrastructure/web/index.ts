// Web Controllers Export
export { ProductsController } from './products.controller';
export { StockController } from './stock.controller';

// Export all controllers as array for module registration
export const ProductsServiceControllers = [
  ProductsController,
  StockController
];
