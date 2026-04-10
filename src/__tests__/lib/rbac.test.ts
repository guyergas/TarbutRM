import { describe, it, expect } from 'vitest';
import {
  hasRole,
  isAdmin,
  isStaffOrAdmin,
  isUser,
  requireRole,
  requireAdmin,
  requireStaffOrAdmin,
} from '@/lib/rbac';

describe('RBAC helpers', () => {
  describe('hasRole', () => {
    it('should return true for user with exact role', () => {
      expect(hasRole('USER', 'USER')).toBe(true);
      expect(hasRole('STAFF', 'STAFF')).toBe(true);
      expect(hasRole('ADMIN', 'ADMIN')).toBe(true);
    });

    it('should follow hierarchy: ADMIN > STAFF > USER', () => {
      // ADMIN can do anything
      expect(hasRole('ADMIN', 'USER')).toBe(true);
      expect(hasRole('ADMIN', 'STAFF')).toBe(true);
      expect(hasRole('ADMIN', 'ADMIN')).toBe(true);

      // STAFF can do STAFF and USER
      expect(hasRole('STAFF', 'USER')).toBe(true);
      expect(hasRole('STAFF', 'STAFF')).toBe(true);
      expect(hasRole('STAFF', 'ADMIN')).toBe(false);

      // USER can only do USER
      expect(hasRole('USER', 'USER')).toBe(true);
      expect(hasRole('USER', 'STAFF')).toBe(false);
      expect(hasRole('USER', 'ADMIN')).toBe(false);
    });

    it('should return false for undefined role', () => {
      expect(hasRole(undefined, 'USER')).toBe(false);
      expect(hasRole(undefined, 'STAFF')).toBe(false);
      expect(hasRole(undefined, 'ADMIN')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true only for ADMIN role', () => {
      expect(isAdmin('ADMIN')).toBe(true);
      expect(isAdmin('STAFF')).toBe(false);
      expect(isAdmin('USER')).toBe(false);
      expect(isAdmin(undefined)).toBe(false);
    });
  });

  describe('isStaffOrAdmin', () => {
    it('should return true for STAFF and ADMIN', () => {
      expect(isStaffOrAdmin('STAFF')).toBe(true);
      expect(isStaffOrAdmin('ADMIN')).toBe(true);
      expect(isStaffOrAdmin('USER')).toBe(false);
      expect(isStaffOrAdmin(undefined)).toBe(false);
    });
  });

  describe('isUser', () => {
    it('should return true for all authenticated roles', () => {
      expect(isUser('USER')).toBe(true);
      expect(isUser('STAFF')).toBe(true);
      expect(isUser('ADMIN')).toBe(true);
      expect(isUser(undefined)).toBe(false);
    });
  });

  describe('requireRole', () => {
    it('should not throw for sufficient role', () => {
      expect(() => requireRole('ADMIN', 'USER')).not.toThrow();
      expect(() => requireRole('STAFF', 'STAFF')).not.toThrow();
    });

    it('should throw for insufficient role', () => {
      expect(() => requireRole('USER', 'STAFF')).toThrow('Insufficient permissions');
      expect(() => requireRole('STAFF', 'ADMIN')).toThrow('Insufficient permissions');
    });

    it('should throw for undefined role', () => {
      expect(() => requireRole(undefined, 'USER')).toThrow('Insufficient permissions');
    });
  });

  describe('requireAdmin', () => {
    it('should not throw for ADMIN role', () => {
      expect(() => requireAdmin('ADMIN')).not.toThrow();
    });

    it('should throw for non-admin roles', () => {
      expect(() => requireAdmin('STAFF')).toThrow('Insufficient permissions');
      expect(() => requireAdmin('USER')).toThrow('Insufficient permissions');
      expect(() => requireAdmin(undefined)).toThrow('Insufficient permissions');
    });
  });

  describe('requireStaffOrAdmin', () => {
    it('should not throw for STAFF and ADMIN', () => {
      expect(() => requireStaffOrAdmin('STAFF')).not.toThrow();
      expect(() => requireStaffOrAdmin('ADMIN')).not.toThrow();
    });

    it('should throw for USER', () => {
      expect(() => requireStaffOrAdmin('USER')).toThrow('Insufficient permissions');
      expect(() => requireStaffOrAdmin(undefined)).toThrow('Insufficient permissions');
    });
  });
});
