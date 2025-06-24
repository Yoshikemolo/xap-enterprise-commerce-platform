import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Products Service Testing API')
    .setDescription('API for testing Products Service functionality')
    .setVersion('1.0')
    .addTag('products', 'Product management operations')
    .addTag('stock', 'Stock and inventory operations')
    .addTag('families', 'Product family operations')
    .addTag('packages', 'Package management operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'products-testing-app' 
    });
  });

  const port = process.env.PORT || 3333;
  await app.listen(port);
  
  console.log(`🚀 Products Testing Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`❤️ Health Check: http://localhost:${port}/health`);
}

bootstrap().catch(console.error);
