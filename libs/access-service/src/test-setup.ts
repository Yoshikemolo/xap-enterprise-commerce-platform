// Jest setup for access-service tests
import 'reflect-metadata';

// Global test configuration
beforeAll(() => {
  // Set up any global test configuration here
  process.env.NODE_ENV = 'test';
  
  // Suppress console logs during testing (optional)
  if (process.env.SUPPRESS_LOGS === 'true') {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

// Clean up after all tests
afterAll(() => {
  // Clean up any global resources here
});

// Configure Jest matchers if needed
expect.extend({
  // Custom matchers can be added here
});

// Mock external dependencies that might cause issues in tests
// Note: These mocks are only applied if the modules are actually imported

// Global test timeout
jest.setTimeout(30000);
