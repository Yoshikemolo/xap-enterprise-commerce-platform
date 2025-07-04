// Unit tests for Shared utilities
import { IdGenerator, ValidationError, NotFoundError } from '@enterprise/shared';

describe('Shared Library', () => {
  describe('IdGenerator', () => {
    it('should generate valid UUID v4', () => {
      const id = IdGenerator.generate();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should validate UUID correctly', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const invalidUuid = 'not-a-uuid';

      expect(IdGenerator.isValid(validUuid)).toBe(true);
      expect(IdGenerator.isValid(invalidUuid)).toBe(false);
    });

    it('should generate unique IDs', () => {
      const id1 = IdGenerator.generate();
      const id2 = IdGenerator.generate();
      expect(id1).not.toBe(id2);
    });
  });

  describe('Error Classes', () => {
    it('should create ValidationError correctly', () => {
      const error = new ValidationError('Test validation error');
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Test validation error');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    it('should create NotFoundError correctly', () => {
      const error = new NotFoundError('User', 'test-id');
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe("User with id 'test-id' not found");
      expect(error.code).toBe('NOT_FOUND');
      expect(error.name).toBe('NotFoundError');
    });
  });
});
