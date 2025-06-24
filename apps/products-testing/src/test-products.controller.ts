import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';

@Controller('products')
export class TestProductsController {
  
  @Get()
  async findAll() {
    return {
      success: true,
      message: 'Products Service is working!',
      data: [],
      timestamp: new Date().toISOString()
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
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
  }

  @Post()
  async create(@Body() createProductDto: any) {
    return {
      success: true,
      message: 'Create product endpoint is working!',
      data: {
        id: Math.floor(Math.random() * 1000),
        ...createProductDto,
        createdAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: any) {
    return {
      success: true,
      message: `Update product ${id} endpoint is working!`,
      data: {
        id: parseInt(id),
        ...updateProductDto,
        updatedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return {
      success: true,
      message: `Delete product ${id} endpoint is working!`,
      data: {
        id: parseInt(id),
        deletedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }
}
