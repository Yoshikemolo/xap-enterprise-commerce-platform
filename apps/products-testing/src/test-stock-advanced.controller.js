const { Controller, Get, Post, Body, Param, Put, Delete, Query } = require('@nestjs/common');

class TestStockController {
  
  constructor() {
    // Mock database for testing - simulates persistent storage
    this.mockStocks = new Map();
    this.mockBatches = new Map();
    this.mockMovements = [];
    this.initializeMockData();
  }

  initializeMockData() {
    // Sample stock records
    this.mockStocks.set(1, {
      id: 1,
      productId: 1,
      productCode: 'PROD-001',
      locationId: 100,
      locationName: 'Warehouse A',
      totalQuantity: 1000,
      availableQuantity: 750,
      reservedQuantity: 200,
      minimumLevel: 100,
      maximumLevel: 2000,
      reorderPoint: 150,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-06-24T12:00:00Z'
    });

    this.mockStocks.set(2, {
      id: 2,
      productId: 2,
      productCode: 'PROD-002',
      locationId: 101,
      locationName: 'Warehouse B',
      totalQuantity: 500,
      availableQuantity: 350,
      reservedQuantity: 150,
      minimumLevel: 50,
      maximumLevel: 1000,
      reorderPoint: 75,
      isActive: true,
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2025-06-24T11:30:00Z'
    });

    // Sample batch records with FIFO/FEFO data
    this.mockBatches.set('BATCH-2024-001', {
      batchNumber: 'BATCH-2024-001',
      stockId: 1,
      productCode: 'PROD-001',
      quantity: 300,
      availableQuantity: 250,
      reservedQuantity: 50,
      productionDate: '2024-01-15T00:00:00Z',
      expirationDate: '2025-01-15T00:00:00Z',
      supplier: 'Supplier Alpha',
      cost: 25.50,
      location: 'A-01-01',
      status: 'AVAILABLE',
      metadata: {
        quality: 'A+',
        certifications: ['ISO9001', 'HACCP'],
        temperature: '-18°C'
      },
      createdAt: '2024-01-15T08:30:00Z',
      updatedAt: '2025-06-24T10:15:00Z'
    });

    this.mockBatches.set('BATCH-2024-002', {
      batchNumber: 'BATCH-2024-002',
      stockId: 1,
      productCode: 'PROD-001',
      quantity: 400,
      availableQuantity: 300,
      reservedQuantity: 100,
      productionDate: '2024-03-01T00:00:00Z',
      expirationDate: '2025-03-01T00:00:00Z',
      supplier: 'Supplier Beta',
      cost: 24.75,
      location: 'A-01-02',
      status: 'AVAILABLE',
      metadata: {
        quality: 'A',
        certifications: ['ISO9001'],
        temperature: '-18°C'
      },
      createdAt: '2024-03-01T09:00:00Z',
      updatedAt: '2025-06-24T09:45:00Z'
    });

    this.mockBatches.set('BATCH-2024-003', {
      batchNumber: 'BATCH-2024-003',
      stockId: 1,
      productCode: 'PROD-001',
      quantity: 300,
      availableQuantity: 200,
      reservedQuantity: 50,
      productionDate: '2024-05-15T00:00:00Z',
      expirationDate: '2024-12-15T00:00:00Z', // Expiring soon!
      supplier: 'Supplier Alpha',
      cost: 26.00,
      location: 'A-01-03',
      status: 'EXPIRING_SOON',
      metadata: {
        quality: 'A+',
        certifications: ['ISO9001', 'HACCP', 'ORGANIC'],
        temperature: '-18°C'
      },
      createdAt: '2024-05-15T07:45:00Z',
      updatedAt: '2025-06-24T08:20:00Z'
    });

    // Sample stock movements for traceability
    this.mockMovements = [
      {
        id: 1,
        stockId: 1,
        batchNumber: 'BATCH-2024-001',
        movementType: 'INBOUND',
        quantity: 300,
        orderId: null,
        reason: 'Initial stock receipt',
        createdAt: '2024-01-15T08:30:00Z',
        createdBy: 'system'
      },
      {
        id: 2,
        stockId: 1,
        batchNumber: 'BATCH-2024-001',
        movementType: 'RESERVED',
        quantity: 50,
        orderId: 'ORDER-123',
        reason: 'Customer order reservation',
        createdAt: '2025-06-20T14:30:00Z',
        createdBy: 'order-system'
      },
      {
        id: 3,
        stockId: 1,
        batchNumber: 'BATCH-2024-002',
        movementType: 'INBOUND',
        quantity: 400,
        orderId: null,
        reason: 'Stock replenishment',
        createdAt: '2024-03-01T09:00:00Z',
        createdBy: 'warehouse-team'
      }
    ];
  }

  // === BASIC STOCK OPERATIONS ===
  
  async findAll(req, res) {
    const stocks = Array.from(this.mockStocks.values());
    const response = {
      success: true,
      message: 'Stock records retrieved successfully',
      data: stocks,
      pagination: {
        total: stocks.length,
        page: 1,
        limit: 20,
        totalPages: 1
      },
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }

  async findOne(req, res) {
    const id = parseInt(req.params.id);
    const stock = this.mockStocks.get(id);
    
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: `Stock record ${id} not found`,
        error: 'STOCK_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    // Include related batches
    const batches = Array.from(this.mockBatches.values())
      .filter(batch => batch.stockId === id);

    const response = {
      success: true,
      message: `Stock record ${id} retrieved successfully`,
      data: {
        ...stock,
        batches: batches
      },
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }

  async create(req, res) {
    const newId = Math.max(...this.mockStocks.keys()) + 1;
    const newStock = {
      id: newId,
      ...req.body,
      totalQuantity: 0,
      availableQuantity: 0,
      reservedQuantity: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.mockStocks.set(newId, newStock);

    const response = {
      success: true,
      message: 'Stock record created successfully',
      data: newStock,
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }

  // === BATCH OPERATIONS ===

  async createBatch(req, res) {
    const stockId = parseInt(req.params.stockId);
    const stock = this.mockStocks.get(stockId);
    
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: `Stock record ${stockId} not found`,
        error: 'STOCK_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    const batchNumber = req.body.batchNumber || `BATCH-${Date.now()}`;
    const quantity = req.body.quantity || 0;

    const newBatch = {
      batchNumber,
      stockId,
      productCode: stock.productCode,
      quantity,
      availableQuantity: quantity,
      reservedQuantity: 0,
      productionDate: req.body.productionDate || new Date().toISOString(),
      expirationDate: req.body.expirationDate,
      supplier: req.body.supplier || 'Unknown Supplier',
      cost: req.body.cost || 0,
      location: req.body.location || 'Default Location',
      status: 'AVAILABLE',
      metadata: req.body.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.mockBatches.set(batchNumber, newBatch);

    // Update stock totals
    stock.totalQuantity += quantity;
    stock.availableQuantity += quantity;
    stock.updatedAt = new Date().toISOString();

    // Add movement record
    this.mockMovements.push({
      id: this.mockMovements.length + 1,
      stockId,
      batchNumber,
      movementType: 'INBOUND',
      quantity,
      orderId: null,
      reason: req.body.reason || 'Batch creation',
      createdAt: new Date().toISOString(),
      createdBy: req.body.createdBy || 'system'
    });

    const response = {
      success: true,
      message: `Batch ${batchNumber} created successfully`,
      data: {
        batch: newBatch,
        stockUpdate: {
          totalQuantity: stock.totalQuantity,
          availableQuantity: stock.availableQuantity
        }
      },
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }

  // === FIFO/FEFO STOCK OPERATIONS ===

  async reserveStock(req, res) {
    try {
      console.log('reserveStock called with:');
      console.log('- params:', req.params);
      console.log('- body:', req.body);
      
      if (!req.body) {
        return res.status(400).json({
          success: false,
          message: 'Request body is missing or invalid',
          error: 'INVALID_REQUEST_BODY',
          timestamp: new Date().toISOString()
        });
      }
      
      const stockId = parseInt(req.params.stockId);
      const { quantity, orderId, preferFEFO = true, reservedBy } = req.body;
      
      // Validate required parameters
      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quantity. Must be a positive number.',
          error: 'INVALID_QUANTITY',
          timestamp: new Date().toISOString()
        });
      }
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required.',
          error: 'MISSING_ORDER_ID',
          timestamp: new Date().toISOString()
        });
      }
    
    const stock = this.mockStocks.get(stockId);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: `Stock record ${stockId} not found`,
        error: 'STOCK_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    if (stock.availableQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${stock.availableQuantity}, Requested: ${quantity}`,
        error: 'INSUFFICIENT_STOCK',
        timestamp: new Date().toISOString()
      });
    }

    // Get available batches for this stock
    const availableBatches = Array.from(this.mockBatches.values())
      .filter(batch => batch.stockId === stockId && batch.availableQuantity > 0 && batch.status === 'AVAILABLE');

    // Sort by FIFO or FEFO logic
    if (preferFEFO) {
      // FEFO: First Expired, First Out
      availableBatches.sort((a, b) => {
        if (a.expirationDate && b.expirationDate) {
          return new Date(a.expirationDate) - new Date(b.expirationDate);
        }
        return new Date(a.createdAt) - new Date(b.createdAt); // Fallback to FIFO
      });
    } else {
      // FIFO: First In, First Out
      availableBatches.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    // Reserve stock from batches
    let remainingToReserve = quantity;
    const reservations = [];

    for (const batch of availableBatches) {
      if (remainingToReserve <= 0) break;

      const toReserveFromBatch = Math.min(remainingToReserve, batch.availableQuantity);
      
      // Update batch quantities
      batch.availableQuantity -= toReserveFromBatch;
      batch.reservedQuantity += toReserveFromBatch;
      batch.updatedAt = new Date().toISOString();

      reservations.push({
        batchNumber: batch.batchNumber,
        quantity: toReserveFromBatch,
        expirationDate: batch.expirationDate,
        location: batch.location
      });

      // Add movement record
      this.mockMovements.push({
        id: this.mockMovements.length + 1,
        stockId,
        batchNumber: batch.batchNumber,
        movementType: 'RESERVED',
        quantity: toReserveFromBatch,
        orderId,
        reason: `Stock reservation for order ${orderId}`,
        createdAt: new Date().toISOString(),
        createdBy: 'order-system'
      });

      remainingToReserve -= toReserveFromBatch;
    }

    // Update stock totals
    stock.availableQuantity -= quantity;
    stock.reservedQuantity += quantity;
    stock.updatedAt = new Date().toISOString();

    const response = {
      success: true,
      message: `Stock reserved successfully using ${preferFEFO ? 'FEFO' : 'FIFO'} logic`,
      data: {
        orderId,
        totalReserved: quantity,
        reservations,
        algorithm: preferFEFO ? 'FEFO (First Expired, First Out)' : 'FIFO (First In, First Out)',
        stockUpdate: {
          availableQuantity: stock.availableQuantity,
          reservedQuantity: stock.reservedQuantity
        }
      },
      timestamp: new Date().toISOString()
    };
    return res.json(response);
    
    } catch (error) {
      console.error('Error in reserveStock:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error in stock reservation',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async consumeStock(req, res) {
    const stockId = parseInt(req.params.stockId);
    const { batchNumber, quantity, orderId } = req.body;
    
    const stock = this.mockStocks.get(stockId);
    const batch = this.mockBatches.get(batchNumber);
    
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: `Stock record ${stockId} not found`,
        error: 'STOCK_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: `Batch ${batchNumber} not found`,
        error: 'BATCH_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    if (batch.reservedQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient reserved stock in batch. Reserved: ${batch.reservedQuantity}, Requested: ${quantity}`,
        error: 'INSUFFICIENT_RESERVED_STOCK',
        timestamp: new Date().toISOString()
      });
    }

    // Update batch quantities
    batch.reservedQuantity -= quantity;
    batch.quantity -= quantity;
    batch.updatedAt = new Date().toISOString();

    // Update stock totals
    stock.reservedQuantity -= quantity;
    stock.totalQuantity -= quantity;
    stock.updatedAt = new Date().toISOString();

    // Add movement record
    this.mockMovements.push({
      id: this.mockMovements.length + 1,
      stockId,
      batchNumber,
      movementType: 'CONSUMED',
      quantity,
      orderId,
      reason: `Stock consumption for order ${orderId}`,
      createdAt: new Date().toISOString(),
      createdBy: 'fulfillment-system'
    });

    const response = {
      success: true,
      message: `Stock consumed successfully from batch ${batchNumber}`,
      data: {
        batchNumber,
        consumedQuantity: quantity,
        orderId,
        batchUpdate: {
          remainingQuantity: batch.quantity,
          reservedQuantity: batch.reservedQuantity
        },
        stockUpdate: {
          totalQuantity: stock.totalQuantity,
          reservedQuantity: stock.reservedQuantity
        }
      },
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }

  async releaseReservation(req, res) {
    const stockId = parseInt(req.params.stockId);
    const { batchNumber, quantity, orderId, reason } = req.body;
    
    const stock = this.mockStocks.get(stockId);
    const batch = this.mockBatches.get(batchNumber);
    
    if (!stock || !batch) {
      return res.status(404).json({
        success: false,
        message: 'Stock or batch not found',
        error: 'RESOURCE_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    // Update batch quantities
    batch.reservedQuantity -= quantity;
    batch.availableQuantity += quantity;
    batch.updatedAt = new Date().toISOString();

    // Update stock totals
    stock.reservedQuantity -= quantity;
    stock.availableQuantity += quantity;
    stock.updatedAt = new Date().toISOString();

    // Add movement record
    this.mockMovements.push({
      id: this.mockMovements.length + 1,
      stockId,
      batchNumber,
      movementType: 'RELEASED',
      quantity,
      orderId,
      reason: reason || `Reservation release for order ${orderId}`,
      createdAt: new Date().toISOString(),
      createdBy: 'order-system'
    });

    const response = {
      success: true,
      message: `Reservation released successfully from batch ${batchNumber}`,
      data: {
        batchNumber,
        releasedQuantity: quantity,
        orderId,
        reason,
        batchUpdate: {
          availableQuantity: batch.availableQuantity,
          reservedQuantity: batch.reservedQuantity
        },
        stockUpdate: {
          availableQuantity: stock.availableQuantity,
          reservedQuantity: stock.reservedQuantity
        }
      },
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }

  // === BATCH TRACEABILITY ===

  async getBatchTraceability(req, res) {
    const batchNumber = req.params.batchNumber;
    const batch = this.mockBatches.get(batchNumber);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: `Batch ${batchNumber} not found`,
        error: 'BATCH_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    const stock = this.mockStocks.get(batch.stockId);
    const movements = this.mockMovements.filter(m => m.batchNumber === batchNumber);
    
    // Calculate batch utilization
    const totalInbound = movements
      .filter(m => m.movementType === 'INBOUND')
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const totalOutbound = movements
      .filter(m => ['CONSUMED', 'RESERVED'].includes(m.movementType))
      .reduce((sum, m) => sum + m.quantity, 0);

    const utilizationPercentage = totalInbound > 0 ? ((totalOutbound / totalInbound) * 100).toFixed(2) : 0;

    // Days in stock
    const daysInStock = Math.ceil((new Date() - new Date(batch.createdAt)) / (1000 * 60 * 60 * 24));
    
    // Days until expiration
    const daysUntilExpiration = batch.expirationDate 
      ? Math.ceil((new Date(batch.expirationDate) - new Date()) / (1000 * 60 * 60 * 24))
      : null;

    const response = {
      success: true,
      message: `Complete traceability for batch ${batchNumber}`,
      data: {
        batch: {
          ...batch,
          utilizationPercentage: parseFloat(utilizationPercentage),
          daysInStock,
          daysUntilExpiration
        },
        product: {
          id: stock?.productId,
          productCode: batch.productCode,
          name: `Product ${batch.productCode}`
        },
        location: {
          id: stock?.locationId,
          name: stock?.locationName || 'Unknown Location',
          specificLocation: batch.location
        },
        movements: movements.map(m => ({
          ...m,
          daysAgo: Math.ceil((new Date() - new Date(m.createdAt)) / (1000 * 60 * 60 * 24))
        })),
        analytics: {
          totalMovements: movements.length,
          totalInbound: totalInbound,
          totalOutbound: totalOutbound,
          currentStatus: batch.status,
          utilizationPercentage: parseFloat(utilizationPercentage),
          daysInStock,
          daysUntilExpiration,
          turnoverRate: daysInStock > 0 ? (totalOutbound / daysInStock).toFixed(2) : 0
        }
      },
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }

  async getBatchesByProduct(req, res) {
    const productCode = req.params.productCode;
    const batches = Array.from(this.mockBatches.values())
      .filter(batch => batch.productCode === productCode);
    
    const response = {
      success: true,
      message: `Batches for product ${productCode}`,
      data: {
        productCode,
        totalBatches: batches.length,
        batches: batches.map(batch => ({
          ...batch,
          daysInStock: Math.ceil((new Date() - new Date(batch.createdAt)) / (1000 * 60 * 60 * 24)),
          daysUntilExpiration: batch.expirationDate 
            ? Math.ceil((new Date(batch.expirationDate) - new Date()) / (1000 * 60 * 60 * 24))
            : null
        }))
      },
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }

  async getExpiringBatches(req, res) {
    const daysAhead = parseInt(req.query.days) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

    const expiringBatches = Array.from(this.mockBatches.values())
      .filter(batch => batch.expirationDate && new Date(batch.expirationDate) <= cutoffDate)
      .map(batch => ({
        ...batch,
        daysUntilExpiration: Math.ceil((new Date(batch.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)),
        urgencyLevel: this.getExpirationUrgency(batch.expirationDate)
      }))
      .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);

    const response = {
      success: true,
      message: `Batches expiring within ${daysAhead} days`,
      data: {
        searchCriteria: {
          daysAhead,
          cutoffDate: cutoffDate.toISOString()
        },
        expiringBatches,
        summary: {
          totalBatches: expiringBatches.length,
          expired: expiringBatches.filter(b => b.daysUntilExpiration <= 0).length,
          critical: expiringBatches.filter(b => b.urgencyLevel === 'CRITICAL').length,
          warning: expiringBatches.filter(b => b.urgencyLevel === 'WARNING').length
        }
      },
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }

  getExpirationUrgency(expirationDate) {
    const daysUntilExpiration = Math.ceil((new Date(expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration <= 0) return 'EXPIRED';
    if (daysUntilExpiration <= 7) return 'CRITICAL';
    if (daysUntilExpiration <= 30) return 'WARNING';
    return 'NORMAL';
  }

  async getStockMovements(req, res) {
    const stockId = req.params.stockId ? parseInt(req.params.stockId) : null;
    const batchNumber = req.query.batchNumber;
    const movementType = req.query.type;
    
    let movements = [...this.mockMovements];
    
    if (stockId) {
      movements = movements.filter(m => m.stockId === stockId);
    }
    
    if (batchNumber) {
      movements = movements.filter(m => m.batchNumber === batchNumber);
    }
    
    if (movementType) {
      movements = movements.filter(m => m.movementType === movementType);
    }

    // Sort by most recent first
    movements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const response = {
      success: true,
      message: 'Stock movements retrieved successfully',
      data: {
        movements,
        filters: {
          stockId,
          batchNumber,
          movementType
        },
        summary: {
          totalMovements: movements.length,
          inbound: movements.filter(m => m.movementType === 'INBOUND').length,
          outbound: movements.filter(m => ['CONSUMED', 'RESERVED'].includes(m.movementType)).length,
          adjustments: movements.filter(m => m.movementType === 'ADJUSTMENT').length
        }
      },
      timestamp: new Date().toISOString()
    };
    return res.json(response);
  }
}

module.exports = TestStockController;
