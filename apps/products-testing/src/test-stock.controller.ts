import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';

@Controller('stock')
export class TestStockController {
  
  @Get()
  async findAll() {
    return {
      success: true,
      message: 'Stock Service is working!',
      data: [],
      timestamp: new Date().toISOString()
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      message: `Stock ${id} endpoint is working!`,
      data: {
        id: parseInt(id),
        productId: 1,
        productCode: 'PROD-001',
        totalQuantity: 100,
        availableQuantity: 80,
        reservedQuantity: 20,
        location: 'Warehouse A'
      },
      timestamp: new Date().toISOString()
    };
  }

  @Post()
  async create(@Body() createStockDto: any) {
    return {
      success: true,
      message: 'Create stock endpoint is working!',
      data: {
        id: Math.floor(Math.random() * 1000),
        ...createStockDto,
        createdAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }

  @Post(':id/reserve')
  async reserveStock(@Param('id') id: string, @Body() reserveDto: any) {
    return {
      success: true,
      message: `Reserve stock ${id} endpoint is working! (FIFO/FEFO logic placeholder)`,
      data: {
        stockId: parseInt(id),
        quantity: reserveDto.quantity || 10,
        orderId: reserveDto.orderId || 'ORDER-123',
        reservations: [
          {
            batchNumber: 'BATCH-2024-001',
            quantity: reserveDto.quantity || 10,
            expirationDate: '2025-12-31'
          }
        ],
        reservedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }

  @Put(':id/consume')
  async consumeStock(@Param('id') id: string, @Body() consumeDto: any) {
    return {
      success: true,
      message: `Consume stock ${id} endpoint is working!`,
      data: {
        stockId: parseInt(id),
        quantity: consumeDto.quantity || 10,
        orderId: consumeDto.orderId || 'ORDER-123',
        batchNumber: consumeDto.batchNumber || 'BATCH-2024-001',
        consumedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }

  @Get('batches/:batchNumber/traceability')
  async getBatchTraceability(@Param('batchNumber') batchNumber: string) {
    return {
      success: true,
      message: `Batch traceability for ${batchNumber} is working!`,
      data: {
        batchNumber,
        product: {
          id: 1,
          productCode: 'PROD-001',
          name: 'Test Product'
        },
        movements: [
          {
            type: 'INBOUND',
            quantity: 100,
            date: '2024-01-01T00:00:00Z',
            reason: 'Initial stock'
          },
          {
            type: 'RESERVED',
            quantity: 20,
            date: '2024-06-01T00:00:00Z',
            orderId: 'ORDER-123'
          }
        ],
        currentStatus: 'AVAILABLE',
        remainingQuantity: 80
      },
      timestamp: new Date().toISOString()
    };
  }
}
