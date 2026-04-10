import { describe, it, expect, beforeEach } from 'vitest';
import { createOrder, cancelOrder, advanceStatus } from '@/modules/order';
import { createUser } from '@/modules/user';
import { getPrismaInstance } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

describe('orderService', () => {
  const prisma = getPrismaInstance();
  let userId: string;
  let staffId: string;
  let adminId: string;
  let itemId: string;
  let sectionId: string;
  let menuId: string;

  beforeEach(async () => {
    // Create test users
    const userResult = await createUser(
      {
        firstName: 'Test',
        lastName: 'User',
        email: 'user@test.com',
        password: 'pass123',
        role: 'USER',
      },
      'system'
    );
    userId = userResult.id;

    const staffResult = await createUser(
      {
        firstName: 'Test',
        lastName: 'Staff',
        email: 'staff@test.com',
        password: 'pass123',
        role: 'STAFF',
      },
      'system'
    );
    staffId = staffResult.id;

    const adminResult = await createUser(
      {
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.com',
        password: 'pass123',
        role: 'ADMIN',
      },
      'system'
    );
    adminId = adminResult.id;

    // Create menu and section for items
    const menu = await prisma.menu.create({
      data: {
        name: 'Test Menu',
        position: 1,
        createdBy: adminId,
      },
    });
    menuId = menu.id;

    const section = await prisma.section.create({
      data: {
        menuId,
        name: 'Test Section',
        position: 1,
        createdBy: adminId,
      },
    });
    sectionId = section.id;

    // Create test item
    const item = await prisma.item.create({
      data: {
        sectionId,
        name: 'Test Item',
        price: '10.00',
        inStock: true,
        position: 1,
        createdBy: adminId,
      },
    });
    itemId = item.id;

    // Credit user balance for ordering
    await prisma.user.update({
      where: { id: userId },
      data: { balance: { set: 100 } },
    });
  });

  describe('createOrder', () => {
    it('should create order successfully with sufficient balance', async () => {
      const order = await createOrder(userId, [{ itemId, quantity: 2 }]);

      expect(order.userId).toBe(userId);
      expect(order.status).toBe('NEW');
      expect(order.total).toBe('20.00');
      expect(order.items.length).toBe(1);

      // Verify balance was deducted
      const user = await prisma.user.findUnique({ where: { id: userId } });
      expect(Number(user!.balance)).toBe(80);
    });

    it('should reject order with insufficient balance', async () => {
      // Set low balance
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { set: 5 } },
      });

      await expect(
        createOrder(userId, [{ itemId, quantity: 2 }])
      ).rejects.toThrow('Insufficient balance');
    });

    it('should reject archived items', async () => {
      // Archive the item
      await prisma.item.update({
        where: { id: itemId },
        data: { archived: true },
      });

      await expect(
        createOrder(userId, [{ itemId, quantity: 1 }])
      ).rejects.toThrow('no longer available');
    });

    it('should create status history on order creation', async () => {
      const order = await createOrder(userId, [{ itemId, quantity: 1 }]);

      const history = await prisma.orderStatusHistory.findMany({
        where: { orderId: order.id },
      });

      expect(history.length).toBe(1);
      expect(history[0].toStatus).toBe('NEW');
      expect(history[0].changedBy).toBe(userId);
    });

    it('should create budget transaction on order', async () => {
      const order = await createOrder(userId, [{ itemId, quantity: 2 }]);

      const tx = await prisma.budgetTransaction.findFirst({
        where: { userId },
      });

      expect(tx).not.toBeNull();
      expect(Number(tx!.amount)).toBe(-20);
    });
  });

  describe('cancelOrder', () => {
    let orderId: string;

    beforeEach(async () => {
      const order = await createOrder(userId, [{ itemId, quantity: 2 }]);
      orderId = order.id;
    });

    it('should cancel NEW order and refund balance', async () => {
      const canceled = await cancelOrder(orderId, userId);

      expect(canceled.status).toBe('COMPLETED');

      // Verify balance was refunded
      const user = await prisma.user.findUnique({ where: { id: userId } });
      expect(Number(user!.balance)).toBe(100); // Refunded to original
    });

    it('should reject cancel by non-owner', async () => {
      const otherUser = await createUser(
        {
          firstName: 'Other',
          lastName: 'User',
          email: 'other@test.com',
          password: 'pass123',
          role: 'USER',
        },
        'system'
      );

      await expect(
        cancelOrder(orderId, otherUser.id)
      ).rejects.toThrow('can only cancel your own orders');
    });

    it('should reject cancel of non-NEW order', async () => {
      // Advance order status
      await advanceStatus(orderId, staffId);

      await expect(
        cancelOrder(orderId, userId)
      ).rejects.toThrow('Cannot cancel order with status IN_PROGRESS');
    });

    it('should create refund budget transaction', async () => {
      await cancelOrder(orderId, userId);

      const txs = await prisma.budgetTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      expect(txs[0].amount).toBe('20'); // Refund amount
    });
  });

  describe('advanceStatus', () => {
    let orderId: string;

    beforeEach(async () => {
      const order = await createOrder(userId, [{ itemId, quantity: 1 }]);
      orderId = order.id;
    });

    it('should advance NEW to IN_PROGRESS', async () => {
      const updated = await advanceStatus(orderId, staffId);

      expect(updated.status).toBe('IN_PROGRESS');

      // Verify history entry
      const history = await prisma.orderStatusHistory.findMany({
        where: { orderId },
      });
      expect(history.length).toBe(2); // Initial + advance
      expect(history[1].fromStatus).toBe('NEW');
      expect(history[1].toStatus).toBe('IN_PROGRESS');
      expect(history[1].changedBy).toBe(staffId);
    });

    it('should advance IN_PROGRESS to COMPLETED', async () => {
      await advanceStatus(orderId, staffId);
      const updated = await advanceStatus(orderId, staffId);

      expect(updated.status).toBe('COMPLETED');

      // Verify history
      const history = await prisma.orderStatusHistory.findMany({
        where: { orderId },
      });
      expect(history[2].fromStatus).toBe('IN_PROGRESS');
      expect(history[2].toStatus).toBe('COMPLETED');
    });

    it('should reject advancing from COMPLETED', async () => {
      await advanceStatus(orderId, staffId);
      await advanceStatus(orderId, staffId);

      await expect(
        advanceStatus(orderId, staffId)
      ).rejects.toThrow('Cannot advance from COMPLETED status');
    });

    it('should work for ADMIN role', async () => {
      const updated = await advanceStatus(orderId, adminId);
      expect(updated.status).toBe('IN_PROGRESS');
    });
  });
});
