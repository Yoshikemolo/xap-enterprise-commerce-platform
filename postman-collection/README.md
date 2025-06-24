# Postman Collection for Products Service Testing

## 📊 Available Collections

### `products-service-testing.postman_collection.json`
Complete API testing collection for the Products Service with the following endpoints:

#### **Health & Status**
- `GET /health` - Health check endpoint
- `GET /test` - Basic test endpoint

#### **Products Management**
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `GET /products/{{productId}}` - Get product by variable ID

#### **Advanced Testing**
- Multiple product ID tests (1, 999, ABC)
- Dynamic variable testing
- Response time validation

## 🚀 How to Use

### 1. Import Collection into Postman
1. Open Postman
2. Click **Import**
3. Select the `products-service-testing.postman_collection.json` file
4. Collection will be imported with all endpoints configured

### 2. Configure Environment (Optional)
The collection uses the following variables:
- `baseUrl` - Default: `http://localhost:3333`
- `productId` - Default: `123` (auto-set)

### 3. Run Tests
1. Make sure the Products Testing app is running: `npm start`
2. Execute individual requests or run the entire collection
3. All requests include automatic tests for:
   - Response time < 1000ms
   - Response has `success` field
   - Response has `timestamp` field

## 📋 Test Results Expected

All endpoints should return JSON responses with the following structure:

```json
{
  "success": true,
  "message": "Service is working!",
  "data": {...},
  "timestamp": "2025-06-24T10:02:16.000Z"
}
```

## 🔧 Troubleshooting

- **Connection Refused**: Make sure the app is running on port 3333
- **404 Errors**: Verify the baseUrl is set correctly
- **Test Failures**: Check that responses match expected JSON structure

## 📝 Notes

This collection tests the simplified Products Service testing application, which runs without database dependencies and uses mock data for rapid development and testing.
