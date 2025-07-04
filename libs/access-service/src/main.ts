import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AccessServiceModule } from './access-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AccessServiceModule);

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
    .setTitle('Access Service API')
    .setDescription('Authentication, Authorization, and User Management API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('users', 'User management operations')
    .addTag('roles', 'Role management operations') 
    .addTag('permissions', 'Permission management operations')
    .addTag('groups', 'Group management operations')
    .addTag('auth', 'Authentication operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'access-service',
      version: '1.0.0',
      message: 'Access Service is running successfully!',
      features: [
        'User Management',
        'Role-Based Access Control (RBAC)', 
        'Group-Based Access Control (GBAC)',
        'Hierarchical Group Management',
        'Permission Management',
        'Security Analytics'
      ]
    });
  });

  const port = process.env.ACCESS_SERVICE_PORT || 3001;
  await app.listen(port);
  
  console.log(`🔐 Access Service is running on: http://localhost:${port}`);
  console.log(`❤️  Health Check: http://localhost:${port}/health`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`👥 Users API: http://localhost:${port}/api/v1/users`);
  console.log(`🔑 Roles API: http://localhost:${port}/api/v1/roles`);
  console.log(`👤 Groups API: http://localhost:${port}/api/v1/groups`);
}

bootstrap().catch(error => {
  console.error('❌ Error starting Access Service:', error);
  process.exit(1);
});
