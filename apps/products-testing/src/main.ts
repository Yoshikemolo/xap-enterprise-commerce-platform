import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
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

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'products-testing-app',
      message: 'Products Testing Service is running successfully!'
    });
  });

  const port = process.env.PORT || 3333;
  await app.listen(port);
  
  console.log(`🚀 Products Testing Application is running on: http://localhost:${port}`);
  console.log(`❤️ Health Check: http://localhost:${port}/health`);
  console.log(`📦 Products API: http://localhost:${port}/products`);
  console.log(`📊 Stock API: http://localhost:${port}/stock`);
}

bootstrap().catch(error => {
  console.error('❌ Error starting application:', error);
  process.exit(1);
});
