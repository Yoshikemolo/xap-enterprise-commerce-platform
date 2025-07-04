import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ProductsServiceModule } from './products-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductsServiceModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS configuration
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Products Service API')
    .setDescription('Product Catalog and Inventory Management API with FIFO/FEFO Logic')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('products', 'Product management operations')
    .addTag('stock', 'Stock and inventory operations')
    .addTag('families', 'Product family management')
    .addTag('packages', 'Package and variant management')
    .addTag('batches', 'Batch tracking and traceability')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'products-service',
      version: '1.0.0',
      message: 'Products Service is running successfully!',
      features: [
        'Product Lifecycle Management',
        'Batch Traceability System',
        'FIFO/FEFO Inventory Logic',
        'Product Code Management',
        'Smart Stock Alerts',
        'Family Hierarchies',
        'Package Variants',
        'Advanced Analytics'
      ]
    });
  });

  const port = process.env.PRODUCTS_SERVICE_PORT || 3002;
  await app.listen(port);
  
  console.log(`🛍️  Products Service is running on: http://localhost:${port}`);
  console.log(`❤️  Health Check: http://localhost:${port}/health`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`📦 Products API: http://localhost:${port}/api/v1/products`);
  console.log(`📊 Stock API: http://localhost:${port}/api/v1/stock`);
  console.log(`🏷️  Families API: http://localhost:${port}/api/v1/families`);
  console.log(`📋 Packages API: http://localhost:${port}/api/v1/packages`);
}

bootstrap().catch(error => {
  console.error('❌ Error starting Products Service:', error);
  process.exit(1);
});
