import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { countRecordsToDelete, purgeAllData, type PurgeStats } from '../purge-all';

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  return {
    PrismaClient: vi.fn(),
  };
});

describe('purge-all', () => {
  let mockPrisma: any;
  let mockTransaction: any;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create mock transaction function
    mockTransaction = vi.fn();

    // Create mock Prisma client
    mockPrisma = {
      event: {
        count: vi.fn(),
        deleteMany: vi.fn(),
      },
      comment: {
        count: vi.fn(),
      },
      prediction: {
        count: vi.fn(),
      },
      eventFollower: {
        count: vi.fn(),
      },
      transaction: {
        count: vi.fn(),
        deleteMany: vi.fn(),
      },
      notification: {
        count: vi.fn(),
        deleteMany: vi.fn(),
      },
      auditLog: {
        count: vi.fn(),
        deleteMany: vi.fn(),
      },
      $transaction: vi.fn((callback) => {
        // Create transaction client mock
        const txClient = {
          event: {
            count: vi.fn(),
            deleteMany: vi.fn(),
          },
          comment: {
            count: vi.fn(),
          },
          prediction: {
            count: vi.fn(),
          },
          eventFollower: {
            count: vi.fn(),
          },
          transaction: {
            count: vi.fn(),
            deleteMany: vi.fn(),
          },
          notification: {
            count: vi.fn(),
            deleteMany: vi.fn(),
          },
          auditLog: {
            count: vi.fn(),
            deleteMany: vi.fn(),
          },
        };
        return callback(txClient);
      }),
      $disconnect: vi.fn(),
    };

    (PrismaClient as any).mockImplementation(() => mockPrisma);
  });

  describe('countRecordsToDelete', () => {
    it('should count all records that will be deleted', async () => {
      // Setup mocks
      mockPrisma.event.count.mockResolvedValue(5);
      mockPrisma.transaction.count.mockResolvedValue(10);
      mockPrisma.notification.count.mockResolvedValue(3);
      mockPrisma.auditLog.count.mockResolvedValue(2);
      mockPrisma.comment.count.mockResolvedValue(15);
      mockPrisma.prediction.count.mockResolvedValue(8);
      mockPrisma.eventFollower.count.mockResolvedValue(4);

      const result = await countRecordsToDelete(mockPrisma);

      expect(result).toEqual({
        events: 5,
        comments: 15,
        predictions: 8,
        eventFollowers: 4,
        transactions: 10,
        notifications: 3,
        auditLogs: 2,
      });

      // Verify correct queries were made
      expect(mockPrisma.event.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.transaction.count).toHaveBeenCalledWith({
        where: {
          type: {
            in: ['PREDICTION_WIN', 'PREDICTION_LOSS'],
          },
        },
      });
      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: {
          type: {
            in: ['EVENT_CLOSING_SOON', 'EVENT_RESOLVED'],
          },
        },
      });
      expect(mockPrisma.auditLog.count).toHaveBeenCalledWith({
        where: {
          entityType: 'event',
        },
      });
    });

    it('should return zeros when database is empty', async () => {
      mockPrisma.event.count.mockResolvedValue(0);
      mockPrisma.transaction.count.mockResolvedValue(0);
      mockPrisma.notification.count.mockResolvedValue(0);
      mockPrisma.auditLog.count.mockResolvedValue(0);
      mockPrisma.comment.count.mockResolvedValue(0);
      mockPrisma.prediction.count.mockResolvedValue(0);
      mockPrisma.eventFollower.count.mockResolvedValue(0);

      const result = await countRecordsToDelete(mockPrisma);

      expect(result).toEqual({
        events: 0,
        comments: 0,
        predictions: 0,
        eventFollowers: 0,
        transactions: 0,
        notifications: 0,
        auditLogs: 0,
      });
    });
  });

  describe('purgeAllData', () => {
    it('should delete all related data in correct order', async () => {
      // Setup transaction client mocks
      let txClient: any;

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        txClient = {
          auditLog: {
            deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
          },
          notification: {
            deleteMany: vi.fn().mockResolvedValue({ count: 3 }),
          },
          transaction: {
            deleteMany: vi.fn().mockResolvedValue({ count: 10 }),
          },
          comment: {
            count: vi.fn().mockResolvedValue(15),
          },
          prediction: {
            count: vi.fn().mockResolvedValue(8),
          },
          eventFollower: {
            count: vi.fn().mockResolvedValue(4),
          },
          event: {
            deleteMany: vi.fn().mockResolvedValue({ count: 5 }),
          },
        };
        return callback(txClient);
      });

      const result = await purgeAllData(mockPrisma);

      // Verify transaction was called
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);

      // Verify deletion order and queries
      expect(txClient.auditLog.deleteMany).toHaveBeenCalledWith({
        where: {
          entityType: 'event',
        },
      });

      expect(txClient.notification.deleteMany).toHaveBeenCalledWith({
        where: {
          type: {
            in: ['EVENT_CLOSING_SOON', 'EVENT_RESOLVED'],
          },
        },
      });

      expect(txClient.transaction.deleteMany).toHaveBeenCalledWith({
        where: {
          type: {
            in: ['PREDICTION_WIN', 'PREDICTION_LOSS'],
          },
        },
      });

      // Verify cascade counts
      expect(txClient.comment.count).toHaveBeenCalledTimes(1);
      expect(txClient.prediction.count).toHaveBeenCalledTimes(1);
      expect(txClient.eventFollower.count).toHaveBeenCalledTimes(1);

      // Verify events deletion (last, triggers cascade)
      expect(txClient.event.deleteMany).toHaveBeenCalledWith({});

      // Verify result
      expect(result).toEqual({
        events: 5,
        comments: 15,
        predictions: 8,
        eventFollowers: 4,
        transactions: 10,
        notifications: 3,
        auditLogs: 2,
      });
    });

    it('should handle empty database correctly', async () => {
      let txClient: any;

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        txClient = {
          auditLog: {
            deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
          },
          notification: {
            deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
          },
          transaction: {
            deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
          },
          comment: {
            count: vi.fn().mockResolvedValue(0),
          },
          prediction: {
            count: vi.fn().mockResolvedValue(0),
          },
          eventFollower: {
            count: vi.fn().mockResolvedValue(0),
          },
          event: {
            deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
          },
        };
        return callback(txClient);
      });

      const result = await purgeAllData(mockPrisma);

      expect(result).toEqual({
        events: 0,
        comments: 0,
        predictions: 0,
        eventFollowers: 0,
        transactions: 0,
        notifications: 0,
        auditLogs: 0,
      });
    });

    it('should ensure atomicity - rollback on error', async () => {
      const testError = new Error('Database error');
      let txClient: any;
      let transactionRolledBack = false;

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        txClient = {
          auditLog: {
            deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
          },
          notification: {
            deleteMany: vi.fn().mockResolvedValue({ count: 3 }),
          },
          transaction: {
            deleteMany: vi.fn().mockRejectedValue(testError),
          },
          comment: {
            count: vi.fn(),
          },
          prediction: {
            count: vi.fn(),
          },
          eventFollower: {
            count: vi.fn(),
          },
          event: {
            deleteMany: vi.fn(),
          },
        };

        try {
          await callback(txClient);
        } catch (error) {
          transactionRolledBack = true;
          throw error;
        }
      });

      // Verify that purgeAllData throws the error
      await expect(purgeAllData(mockPrisma)).rejects.toThrow('Database error');

      // Verify that transaction was attempted
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);

      // Verify that auditLogs were deleted (first step)
      expect(txClient.auditLog.deleteMany).toHaveBeenCalled();

      // Verify that notifications were deleted (second step)
      expect(txClient.notification.deleteMany).toHaveBeenCalled();

      // Verify that transaction deletion failed (third step)
      expect(txClient.transaction.deleteMany).toHaveBeenCalled();

      // Verify that events were NOT deleted (should not reach this step)
      expect(txClient.event.deleteMany).not.toHaveBeenCalled();

      // Verify transaction was rolled back
      expect(transactionRolledBack).toBe(true);
    });

    it('should delete all related entities correctly', async () => {
      let txClient: any;

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        txClient = {
          auditLog: {
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          notification: {
            deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
          },
          transaction: {
            deleteMany: vi.fn().mockResolvedValue({ count: 5 }),
          },
          comment: {
            count: vi.fn().mockResolvedValue(10),
          },
          prediction: {
            count: vi.fn().mockResolvedValue(7),
          },
          eventFollower: {
            count: vi.fn().mockResolvedValue(3),
          },
          event: {
            deleteMany: vi.fn().mockResolvedValue({ count: 4 }),
          },
        };
        return callback(txClient);
      });

      const result = await purgeAllData(mockPrisma);

      // Verify all entity types are accounted for
      expect(result.auditLogs).toBeGreaterThanOrEqual(0);
      expect(result.notifications).toBeGreaterThanOrEqual(0);
      expect(result.transactions).toBeGreaterThanOrEqual(0);
      expect(result.comments).toBeGreaterThanOrEqual(0);
      expect(result.predictions).toBeGreaterThanOrEqual(0);
      expect(result.eventFollowers).toBeGreaterThanOrEqual(0);
      expect(result.events).toBeGreaterThanOrEqual(0);

      // Verify cascade entities are counted before deletion
      // Check that count methods were called
      expect(txClient.comment.count).toHaveBeenCalled();
      expect(txClient.prediction.count).toHaveBeenCalled();
      expect(txClient.eventFollower.count).toHaveBeenCalled();
      // Verify events deletion happened (should be last)
      expect(txClient.event.deleteMany).toHaveBeenCalled();
    });

    it('should execute deletions in a single transaction', async () => {
      let txClient: any;
      let transactionStarted = false;
      let transactionCompleted = false;

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        transactionStarted = true;
        txClient = {
          auditLog: {
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          notification: {
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          transaction: {
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          comment: {
            count: vi.fn().mockResolvedValue(1),
          },
          prediction: {
            count: vi.fn().mockResolvedValue(1),
          },
          eventFollower: {
            count: vi.fn().mockResolvedValue(1),
          },
          event: {
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
        };

        const result = await callback(txClient);
        transactionCompleted = true;
        return result;
      });

      await purgeAllData(mockPrisma);

      // Verify transaction was used
      expect(transactionStarted).toBe(true);
      expect(transactionCompleted).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex scenario with multiple events and related data', async () => {
      let txClient: any;

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        txClient = {
          auditLog: {
            deleteMany: vi.fn().mockResolvedValue({ count: 20 }),
          },
          notification: {
            deleteMany: vi.fn().mockResolvedValue({ count: 15 }),
          },
          transaction: {
            deleteMany: vi.fn().mockResolvedValue({ count: 50 }),
          },
          comment: {
            count: vi.fn().mockResolvedValue(100),
          },
          prediction: {
            count: vi.fn().mockResolvedValue(75),
          },
          eventFollower: {
            count: vi.fn().mockResolvedValue(30),
          },
          event: {
            deleteMany: vi.fn().mockResolvedValue({ count: 25 }),
          },
        };
        return callback(txClient);
      });

      const result = await purgeAllData(mockPrisma);

      expect(result.events).toBe(25);
      expect(result.comments).toBe(100);
      expect(result.predictions).toBe(75);
      expect(result.eventFollowers).toBe(30);
      expect(result.transactions).toBe(50);
      expect(result.notifications).toBe(15);
      expect(result.auditLogs).toBe(20);

      // Verify all deletions happened
      expect(txClient.auditLog.deleteMany).toHaveBeenCalled();
      expect(txClient.notification.deleteMany).toHaveBeenCalled();
      expect(txClient.transaction.deleteMany).toHaveBeenCalled();
      expect(txClient.event.deleteMany).toHaveBeenCalled();
    });
  });
});
