// Unit tests for User Query Classes
import { GetUserByIdQuery } from './user.queries';
import { NotFoundError } from '@enterprise/shared';

describe('User Queries', () => {
  describe('GetUserByIdQuery', () => {
    it('should be defined with correct properties', () => {
      const userId = 'test-user-id';
      const query = new GetUserByIdQuery(userId);
      
      expect(query).toBeDefined();
      expect(query.userId).toBe(userId);
    });
  });
  
  describe('NotFoundError from shared library', () => {
    it('should create error with correct message', () => {
      const error = new NotFoundError('User', 'test-id');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("User with id 'test-id' not found");
      expect(error.name).toBe('NotFoundError');
    });
  });
});
