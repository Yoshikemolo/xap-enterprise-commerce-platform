# Products Testing Application

## 🎯 Overview

This is a simplified NestJS application designed for rapid testing and development of Products Service APIs without the complexity of the full enterprise architecture.

## 🚀 Quick Start

```bash
# Navigate to testing directory
cd apps/products-testing

# Start the testing server
npm start

# Server will be available at http://localhost:3333
```

## 📊 Available Endpoints

### Health & Status
- `GET /health` - Health check and service status
- `GET /test` - Basic connectivity test

### Products API
- `GET /products` - Get all products (returns mock data)
- `GET /products/:id` - Get product by ID (dynamic response)

## 🧪 Testing with Postman

1. **Import Collection**: Use `../../postman-collection/products-service-testing.postman_collection.json`
2. **Run Tests**: Execute all requests to verify functionality
3. **Automated Validation**: Each request includes response time and structure tests

## 🛠️ Technical Details

### Architecture
- **Framework**: NestJS (simplified)
- **Language**: JavaScript (bypasses TypeScript decorator issues)
- **Dependencies**: Minimal - only essential NestJS components
- **Data**: Mock responses for rapid development

### Benefits
- ✅ **Fast Startup**: < 10 seconds
- ✅ **No Database Required**: Works with mock data
- ✅ **CORS Enabled**: Ready for frontend integration
- ✅ **Error Handling**: Proper HTTP responses
- ✅ **Validation**: Request/response structure validation

### Response Format
All endpoints return consistent JSON structure:
```json
{
  "success": true,
  "message": "Description of operation",
  "data": {...},
  "timestamp": "2025-06-24T12:02:16.000Z"
}
```

## 📝 Files Structure

```
apps/products-testing/
├── src/
│   ├── main.js                 # Main application file (JavaScript)
│   ├── main.ts                 # TypeScript version (has decorator issues)
│   ├── app.module.ts           # NestJS application module
│   ├── products-testing.module.ts # Simplified testing module
│   ├── test-products.controller.ts # Products controller (TypeScript)
│   └── test-stock.controller.ts    # Stock controller (TypeScript)
├── package.json                # NPM scripts
└── tsconfig.app.json          # TypeScript configuration
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3333)
- `NODE_ENV` - Environment (default: development)

### NPM Scripts
- `npm start` - Start with JavaScript (working)
- `npm run start:ts` - Start with TypeScript (has issues)

## 🐛 Known Issues

### TypeScript Decorators
- **Problem**: Decorator compilation issues with current TypeScript configuration
- **Workaround**: Using JavaScript version (`main.js`)
- **Status**: Will be resolved in next development phase

### Limited Functionality
- **Current**: Mock data responses only
- **Future**: Will integrate with real Products Service CQRS implementation
- **Database**: Currently no database connectivity (by design for testing)

## 🎯 Next Steps

### Immediate Improvements
1. **Fix TypeScript decorators** for production use
2. **Add database connectivity** for real data testing
3. **Implement POST/PUT/DELETE** operations
4. **Add stock operations** (reserve, consume, traceability)

### Integration Path
1. **Connect to real Products Service** CQRS implementation
2. **Add authentication** and authorization testing
3. **Performance testing** with real data volumes
4. **Error scenario testing** for edge cases

## 📞 Support

This testing application was created to enable rapid development and validation of the Products Service APIs. For issues or enhancements, refer to the main project documentation.

**Created**: June 24, 2025  
**Purpose**: Enable rapid API testing and development  
**Status**: ✅ Fully functional for basic testing needs
