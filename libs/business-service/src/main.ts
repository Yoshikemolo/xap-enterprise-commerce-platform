import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';

@Module({})
class BusinessServiceStubModule {}

async function bootstrap() {
  const app = await NestFactory.create(BusinessServiceStubModule);

  // CORS configuration
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({ 
      status: 'development', 
      timestamp: new Date().toISOString(),
      service: 'business-service',
      version: '0.0.1',
      message: 'Business Service is in development phase',
      nextPhase: 'Analytics and BI Implementation'
    });
  });

  // Stub endpoints
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({
      message: 'Business Service - Coming Soon!',
      status: 'In Development',
      expectedFeatures: [
        'Business Analytics',
        'Reporting Engine',
        'KPI Dashboards',
        'NPS Management',
        'Business Intelligence',
        'Performance Metrics'
      ]
    });
  });

  const port = process.env.BUSINESS_SERVICE_PORT || 3005;
  await app.listen(port);
  
  console.log(`📊 Business Service (DEV) is running on: http://localhost:${port}`);
  console.log(`❤️  Health Check: http://localhost:${port}/health`);
  console.log(`📋 Status: In Development Phase`);
}

bootstrap().catch(error => {
  console.error('❌ Error starting Business Service stub:', error);
  process.exit(1);
});
