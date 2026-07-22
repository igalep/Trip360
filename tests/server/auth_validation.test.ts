import { describe, expect, it } from '@jest/globals';
import { RegisterUserSchema, LoginUserSchema } from '../../src/server/schemas/auth.schema';

describe('Auth Validation Schemas', () => {
  describe('RegisterUserSchema', () => {
    it('should validate valid user registration payload', async () => {
      const validPayload = {
        email: 'TEST@example.com',
        password: 'securepassword123',
        name: 'John Doe',
      };
      const result = await RegisterUserSchema.parseAsync(validPayload);
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('John Doe');
      expect(result.password).toBe('securepassword123');
    });

    it('should fail validation on invalid email', async () => {
      const invalidPayload = {
        email: 'invalid-email',
        password: 'securepassword123',
        name: 'John Doe',
      };
      await expect(RegisterUserSchema.parseAsync(invalidPayload)).rejects.toThrow();
    });

    it('should fail validation when password is too short', async () => {
      const shortPasswordPayload = {
        email: 'test@example.com',
        password: '123',
        name: 'John Doe',
      };
      await expect(RegisterUserSchema.parseAsync(shortPasswordPayload)).rejects.toThrow();
    });
  });

  describe('LoginUserSchema', () => {
    it('should validate valid user login payload', async () => {
      const validPayload = {
        email: 'USER@example.com',
        password: 'myPassword123',
      };
      const result = await LoginUserSchema.parseAsync(validPayload);
      expect(result.email).toBe('user@example.com');
      expect(result.password).toBe('myPassword123');
    });

    it('should fail validation on missing password', async () => {
      const emptyPasswordPayload = {
        email: 'user@example.com',
        password: '',
      };
      await expect(LoginUserSchema.parseAsync(emptyPasswordPayload)).rejects.toThrow();
    });
  });
});
