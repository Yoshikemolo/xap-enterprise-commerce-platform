require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');

// Simple controller without decorators - just a class
class TestController {
  async findAll(req, res) {
    const response = {
      success: true,
      message: 'Products Service is working!',
      data: [],
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }

  async findOne(req, res) {
    const id = req.params.id;
    const response = {
      success: true,
      message: `Product ${id} endpoint is working!`,
      data: {
        id: parseInt(id),
        productCode: `PROD-${id}`,
        name: `Test Product ${id}`,
        description: 'This is a test product'
      },
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }
}

// Simple module
class AppModule {}

async function bootstrap() {
  try {
    // Create a minimal NestJS app
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Get the underlying Express instance
    const server = app.getHttpAdapter().getInstance();
    const controller = new TestController();

    // Define routes manually
    server.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'products-testing-app',
        message: 'Products Testing Service is running successfully!'
      });
    });

    server.get('/products', (req, res) => {
      controller.findAll(req, res);
    });

    server.get('/products/:id', (req, res) => {
      controller.findOne(req, res);
    });

    // Additional test endpoints
    server.get('/test', (req, res) => {
      res.json({
        message: 'Test endpoint working!',
        timestamp: new Date().toISOString()
      });
    });

    const port = process.env.PORT || 3333;
    await app.listen(port);
    
    console.log(`🚀 Products Testing Application is running on: http://localhost:${port}`);
    console.log(`❤️ Health Check: http://localhost:${port}/health`);
    console.log(`🧪 Test Endpoint: http://localhost:${port}/test`);
    console.log(`📦 Products API: http://localhost:${port}/products`);
    console.log(`📦 Product by ID: http://localhost:${port}/products/123`);
    
    return app;
  } catch (error) {
    console.error('❌ Error starting application:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

bootstrap();
