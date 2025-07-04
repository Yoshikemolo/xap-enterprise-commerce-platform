import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';

@Module({})
class SchedulingServiceStubModule {}

async function bootstrap() {
  const app = await NestFactory.create(SchedulingServiceStubModule);

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
      service: 'scheduling-service',
      version: '0.0.1',
      message: 'Scheduling Service is in development phase',
      nextPhase: 'Calendar and Events Implementation'
    });
  });

  // Stub endpoints
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({
      message: 'Scheduling Service - Coming Soon!',
      status: 'In Development',
      expectedFeatures: [
        'Calendar Management',
        'Event Scheduling',
        'Notifications System',
        'Alert Management',
        'Process Automation'
      ]
    });
  });

  const port = process.env.SCHEDULING_SERVICE_PORT || 3004;
  await app.listen(port);
  
  console.log(`📅 Scheduling Service (DEV) is running on: http://localhost:${port}`);
  console.log(`❤️  Health Check: http://localhost:${port}/health`);
  console.log(`📋 Status: In Development Phase`);
}

bootstrap().catch(error => {
  console.error('❌ Error starting Scheduling Service stub:', error);
  process.exit(1);
});
