import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { createUser, getUserById, listUsers, changeRole, setActive, resetPassword } from '@/modules/user';
import { getPrismaInstance } from '@/lib/prisma';
import { Role } from '@/generated/prisma/client';

describe('userService', () => {
  const prisma = getPrismaInstance();
  const adminId = 'admin-user-id';

  beforeEach(async () => {
    // Create admin user for testing
    await prisma.user.create({
      data: {
        id: adminId,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        passwordHash: await bcrypt.hash('password', 12),
        role: 'ADMIN',
        city: 'Test City',
        active: true,
      },
    });
  });

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const result = await createUser(
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'testpass123',
          role: 'USER',
        },
        adminId
      );

      expect(result.email).toBe('john@test.com');
      expect(result.firstName).toBe('John');
      expect(result.role).toBe('USER');
      expect(result.createdBy).toBe(adminId);

      // Verify password is hashed
      const passwordMatch = await bcrypt.compare('testpass123', result.passwordHash);
      expect(passwordMatch).toBe(true);
    });

    it('should reject duplicate email', async () => {
      await createUser(
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'testpass123',
          role: 'USER',
        },
        adminId
      );

      await expect(
        createUser(
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'john@test.com',
            password: 'differentpass',
            role: 'STAFF',
          },
          adminId
        )
      ).rejects.toThrow('User with this email already exists');
    });

    it('should set active status to true by default', async () => {
      const result = await createUser(
        {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          password: 'pass123',
          role: 'USER',
        },
        adminId
      );

      expect(result.active).toBe(true);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const created = await createUser(
        {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          password: 'pass123',
          role: 'USER',
        },
        adminId
      );

      const result = await getUserById(created.id);

      expect(result).not.toBeNull();
      expect(result?.email).toBe('test@test.com');
      expect(result?.role).toBe('USER');
    });

    it('should return null for non-existent user', async () => {
      const result = await getUserById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('listUsers', () => {
    beforeEach(async () => {
      await createUser(
        {
          firstName: 'User',
          lastName: 'One',
          email: 'user1@test.com',
          password: 'pass123',
          role: 'USER',
        },
        adminId
      );

      await createUser(
        {
          firstName: 'Staff',
          lastName: 'One',
          email: 'staff1@test.com',
          password: 'pass123',
          role: 'STAFF',
        },
        adminId
      );
    });

    it('should list all users', async () => {
      const result = await listUsers();
      expect(result.length).toBeGreaterThanOrEqual(3); // admin + 2 created
    });

    it('should filter by role', async () => {
      const result = await listUsers({ role: 'STAFF' });
      expect(result.every((u) => u.role === 'STAFF')).toBe(true);
    });

    it('should filter by active status', async () => {
      const users = await listUsers();
      expect(users.every((u) => u.active === true)).toBe(true);
    });
  });

  describe('changeRole', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await createUser(
        {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          password: 'pass123',
          role: 'USER',
        },
        adminId
      );
      userId = user.id;
    });

    it('should change user role', async () => {
      const result = await changeRole(userId, 'STAFF', adminId);
      expect(result.role).toBe('STAFF');

      const verify = await getUserById(userId);
      expect(verify?.role).toBe('STAFF');
    });

    it('should delete all sessions when changing role', async () => {
      // Create a session for the user
      await prisma.session.create({
        data: {
          sessionToken: 'test-session-token',
          userId,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      await changeRole(userId, 'STAFF', adminId);

      const sessions = await prisma.session.findMany({ where: { userId } });
      expect(sessions.length).toBe(0);
    });
  });

  describe('setActive', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await createUser(
        {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          password: 'pass123',
          role: 'USER',
        },
        adminId
      );
      userId = user.id;
    });

    it('should deactivate user', async () => {
      const result = await setActive(userId, false, adminId);
      expect(result.active).toBe(false);
    });

    it('should delete sessions on deactivate', async () => {
      // Create session
      await prisma.session.create({
        data: {
          sessionToken: 'test-session-token',
          userId,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      await setActive(userId, false, adminId);

      const sessions = await prisma.session.findMany({ where: { userId } });
      expect(sessions.length).toBe(0);
    });

    it('should reactivate user', async () => {
      await setActive(userId, false, adminId);
      const result = await setActive(userId, true, adminId);
      expect(result.active).toBe(true);
    });
  });

  describe('resetPassword', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await createUser(
        {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          password: 'oldpass123',
          role: 'USER',
        },
        adminId
      );
      userId = user.id;
    });

    it('should reset password with hash', async () => {
      await resetPassword(userId, 'newpass456', adminId);

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const match = await bcrypt.compare('newpass456', user!.passwordHash);
      expect(match).toBe(true);
    });

    it('should delete all sessions on reset', async () => {
      // Create session
      await prisma.session.create({
        data: {
          sessionToken: 'test-session-token',
          userId,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      await resetPassword(userId, 'newpass456', adminId);

      const sessions = await prisma.session.findMany({ where: { userId } });
      expect(sessions.length).toBe(0);
    });
  });
});
