require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');

// Import controllers
const TestStockController = require('./test-stock-advanced.controller');

// Simple controller without decorators - just a class
class TestProductsController {
  async findAll(req, res) {
    const response = {
      success: true,
      message: 'Products Service is working!',
      data: [
        {
          id: 1,
          productCode: 'PROD-001',
          name: 'Premium Coffee Beans',
          description: 'High-quality arabica coffee beans',
          familyId: 10,
          familyName: 'Beverages',
          isActive: true,
          specifications: [
            { key: 'origin', value: 'Colombia', unit: 'country' },
            { key: 'roast', value: 'Medium', unit: 'level' },
            { key: 'weight', value: '1', unit: 'kg' }
          ],
          createdAt: '2024-01-15T00:00:00Z'
        },
        {
          id: 2,
          productCode: 'PROD-002',
          name: 'Organic Tea Leaves',
          description: 'Premium organic green tea',
          familyId: 10,
          familyName: 'Beverages',
          isActive: true,
          specifications: [
            { key: 'type', value: 'Green Tea', unit: 'variety' },
            { key: 'organic', value: 'Yes', unit: 'certification' },
            { key: 'weight', value: '500', unit: 'g' }
          ],
          createdAt: '2024-02-01T00:00:00Z'
        }
      ],
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
        productCode: `PROD-${String(id).padStart(3, '0')}`,
        name: `Test Product ${id}`,
        description: 'This is a test product with enhanced details',
        familyId: 10,
        familyName: 'Test Family',
        isActive: true,
        specifications: [
          { key: 'weight', value: '1', unit: 'kg' },
          { key: 'dimensions', value: '10x10x10', unit: 'cm' },
          { key: 'color', value: 'Blue', unit: 'color' }
        ],
        media: [
          {
            id: 'img-1',
            type: 'image',
            url: `https://example.com/products/${id}/main.jpg`,
            isPrimary: true
          }
        ],
        packages: [
          {
            id: 1,
            code: `PKG-${id}-001`,
            name: 'Standard Package',
            unitOfMeasure: 'piece',
            quantity: 1,
            isDefault: true,
            barcodes: [`123456789${id}12`]
          }
        ],
        stockSummary: {
          totalLocations: 2,
          totalQuantity: 1500,
          availableQuantity: 1100,
          reservedQuantity: 400,
          lowStockAlert: false
        },
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }

  async create(req, res) {
    const response = {
      success: true,
      message: 'Create product endpoint is working!',
      data: {
        id: Math.floor(Math.random() * 1000) + 1000,
        ...req.body,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }

  async update(req, res) {
    const id = req.params.id;
    const response = {
      success: true,
      message: `Update product ${id} endpoint is working!`,
      data: {
        id: parseInt(id),
        ...req.body,
        updatedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }

  async delete(req, res) {
    const id = req.params.id;
    const response = {
      success: true,
      message: `Delete product ${id} endpoint is working!`,
      data: {
        id: parseInt(id),
        deletedAt: new Date().toISOString()
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
    
    // Configure middleware for parsing JSON
    server.use(require('express').json({ limit: '10mb' }));
    server.use(require('express').urlencoded({ extended: true, limit: '10mb' }));
    
    // Debug middleware to log requests
    server.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
      }
      next();
    });
    
    const productsController = new TestProductsController();
    const stockController = new TestStockController();

    // === HEALTH & STATUS ENDPOINTS ===
    server.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'products-testing-app',
        message: 'Products Testing Service with Advanced Stock Operations',
        version: '1.1.1',
        features: [
          'Products CRUD',
          'Advanced Stock Management',
          'FIFO/FEFO Logic',
          'Batch Traceability',
          'Stock Movements',
          'Expiration Monitoring'
        ]
      });
    });

    server.get('/test', (req, res) => {
      res.json({
        message: 'Advanced testing endpoints are working!',
        timestamp: new Date().toISOString(),
        availableEndpoints: {
          products: [
            'GET /products',
            'GET /products/:id',
            'POST /products',
            'PUT /products/:id',
            'DELETE /products/:id'
          ],
          stock: [
            'GET /stock',
            'GET /stock/:id',
            'POST /stock',
            'POST /stock/:stockId/batches',
            'POST /stock/:stockId/reserve',
            'POST /stock/:stockId/consume',
            'POST /stock/:stockId/release'
          ],
          traceability: [
            'GET /batches/:batchNumber/traceability',
            'GET /batches/product/:productCode',
            'GET /batches/expiring',
            'GET /stock/:stockId/movements',
            'GET /movements'
          ]
        }
      });
    });

    // === PRODUCTS ENDPOINTS ===
    server.get('/products', (req, res) => productsController.findAll(req, res));
    server.get('/products/:id', (req, res) => productsController.findOne(req, res));
    server.post('/products', (req, res) => productsController.create(req, res));
    server.put('/products/:id', (req, res) => productsController.update(req, res));
    server.delete('/products/:id', (req, res) => productsController.delete(req, res));

    // === BASIC STOCK ENDPOINTS ===
    server.get('/stock', (req, res) => stockController.findAll(req, res));
    server.get('/stock/:id', (req, res) => stockController.findOne(req, res));
    server.post('/stock', (req, res) => stockController.create(req, res));

    // === BATCH MANAGEMENT ENDPOINTS ===
    server.post('/stock/:stockId/batches', (req, res) => stockController.createBatch(req, res));

    // === ADVANCED STOCK OPERATIONS (FIFO/FEFO) ===
    server.post('/stock/:stockId/reserve', (req, res) => stockController.reserveStock(req, res));
    server.post('/stock/:stockId/consume', (req, res) => stockController.consumeStock(req, res));
    server.post('/stock/:stockId/release', (req, res) => stockController.releaseReservation(req, res));

    // === BATCH TRACEABILITY ENDPOINTS ===
    server.get('/batches/:batchNumber/traceability', (req, res) => stockController.getBatchTraceability(req, res));
    server.get('/batches/product/:productCode', (req, res) => stockController.getBatchesByProduct(req, res));
    server.get('/batches/expiring', (req, res) => stockController.getExpiringBatches(req, res));

    // === STOCK MOVEMENTS & AUDIT TRAIL ===
    server.get('/stock/:stockId/movements', (req, res) => stockController.getStockMovements(req, res));
    server.get('/movements', (req, res) => stockController.getStockMovements(req, res));

    // === ADDITIONAL UTILITY ENDPOINTS ===
    server.get('/stock/alerts/low-stock', (req, res) => {
      res.json({
        success: true,
        message: 'Low stock alerts endpoint working!',
        data: {
          alerts: [
            {
              stockId: 1,
              productCode: 'PROD-001',
              currentStock: 100,
              minimumLevel: 150,
              urgency: 'HIGH'
            }
          ]
        },
        timestamp: new Date().toISOString()
      });
    });

    server.get('/analytics/inventory-summary', (req, res) => {
      res.json({
        success: true,
        message: 'Inventory analytics endpoint working!',
        data: {
          totalProducts: 2,
          totalBatches: 3,
          totalStockValue: 125000.50,
          expiringBatches: 1,
          lowStockAlerts: 1,
          averageUtilization: 67.5
        },
        timestamp: new Date().toISOString()
      });
    });

    const port = process.env.PORT || 3333;
    await app.listen(port);
    
    console.log(`🚀 Products Testing Application is running on: http://localhost:${port}`);
    console.log(`❤️ Health Check: http://localhost:${port}/health`);
    console.log(`🧪 Test Endpoint: http://localhost:${port}/test`);
    console.log(`\n📦 PRODUCTS API:`);
    console.log(`   GET    /products          - List all products`);
    console.log(`   GET    /products/:id      - Get product by ID`);
    console.log(`   POST   /products          - Create new product`);
    console.log(`   PUT    /products/:id      - Update product`);
    console.log(`   DELETE /products/:id      - Delete product`);
    console.log(`\n📊 STOCK MANAGEMENT API:`);
    console.log(`   GET    /stock             - List all stock records`);
    console.log(`   GET    /stock/:id         - Get stock with batches`);
    console.log(`   POST   /stock             - Create stock record`);
    console.log(`   POST   /stock/:id/batches - Add new batch`);
    console.log(`\n🔄 ADVANCED STOCK OPERATIONS (FIFO/FEFO):`);
    console.log(`   POST   /stock/:id/reserve - Reserve stock (FIFO/FEFO)`);
    console.log(`   POST   /stock/:id/consume - Consume reserved stock`);
    console.log(`   POST   /stock/:id/release - Release reservation`);
    console.log(`\n🔍 BATCH TRACEABILITY:`);
    console.log(`   GET    /batches/:batchNumber/traceability - Complete batch trace`);
    console.log(`   GET    /batches/product/:productCode     - Batches by product`);
    console.log(`   GET    /batches/expiring?days=30         - Expiring batches`);
    console.log(`\n📈 AUDIT & MOVEMENTS:`);
    console.log(`   GET    /stock/:id/movements - Stock movements by stock`);
    console.log(`   GET    /movements           - All movements (filterable)`);
    console.log(`   GET    /stock/alerts/low-stock           - Low stock alerts`);
    console.log(`   GET    /analytics/inventory-summary      - Inventory analytics`);
    
    return app;
  } catch (error) {
    console.error('❌ Error starting application:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

bootstrap();
