/**
 * Tests for runPipelineV2 - Event generation pipeline
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { runPipelineV2 } from '../runPipelineV2';
import type { EventInput, PipelineResult } from '../types';
import { prisma } from '@/lib/prisma';

describe('runPipelineV2', () => {
  let testUser: { id: string };
  const now = new Date('2026-02-18T12:00:00Z');

  beforeEach(async () => {
    // Create a test user for event creation
    testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        credits: 1000,
      },
    });
  });

  afterEach(async () => {
    // Clean up: delete all events created by test user (cascade will handle related data)
    await prisma.event.deleteMany({
      where: { createdById: testUser.id },
    });
    
    // Delete test user
    await prisma.user.delete({
      where: { id: testUser.id },
    });
  });

  /**
   * Helper to create a valid event input
   */
  function createValidEventInput(overrides?: Partial<EventInput>): EventInput {
    const closesAt = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now
    return {
      title: 'Test Event',
      description: 'Test description',
      category: 'Sport',
      closesAt,
      createdById: testUser.id,
      b: 100,
      resolutionBufferHours: 24,
      ...overrides,
    };
  }

  describe('Valid event generation', () => {
    it('should create a single valid event', async () => {
      const input = createValidEventInput({
        title: 'Will Team A win the match?',
        category: 'Sport',
      });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(true);
      expect(result.total).toBe(1);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].success).toBe(true);
      expect(result.results[0].eventId).toBeDefined();

      // Verify event was actually created in database
      const event = await prisma.event.findUnique({
        where: { id: result.results[0].eventId! },
      });

      expect(event).toBeDefined();
      expect(event?.title).toBe('Will Team A win the match?');
      expect(event?.category).toBe('Sport');
      expect(event?.createdById).toBe(testUser.id);
      expect(event?.b).toBe(100);
      expect(event?.resolutionStatus).toBe('PENDING');
      expect(event?.resolved).toBe(false);
    });

    it('should create multiple valid events', async () => {
      const inputs: EventInput[] = [
        createValidEventInput({ title: 'Event 1', category: 'Sport' }),
        createValidEventInput({ title: 'Event 2', category: 'Politica' }),
        createValidEventInput({ title: 'Event 3', category: 'Economia' }),
      ];

      const result = await runPipelineV2(inputs);

      expect(result.allSuccessful).toBe(true);
      expect(result.total).toBe(3);
      expect(result.successful).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(3);

      // Verify all events were created
      const eventIds = result.results
        .filter((r) => r.success)
        .map((r) => r.eventId!);
      const events = await prisma.event.findMany({
        where: { id: { in: eventIds } },
      });

      expect(events).toHaveLength(3);
      expect(events.map((e) => e.title)).toEqual(
        expect.arrayContaining(['Event 1', 'Event 2', 'Event 3'])
      );
    });

    it('should create events with optional fields', async () => {
      const input = createValidEventInput({
        title: 'Event with optional fields',
        description: 'This is a description',
        resolutionSourceUrl: 'https://example.com/source',
        resolutionNotes: 'Resolution notes here',
        realWorldEventTime: new Date(now.getTime() + 30 * 60 * 60 * 1000),
        resolutionTimeExpected: new Date(now.getTime() + 31 * 60 * 60 * 1000),
      });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(true);
      expect(result.results[0].success).toBe(true);

      const event = await prisma.event.findUnique({
        where: { id: result.results[0].eventId! },
      });

      expect(event?.description).toBe('This is a description');
      expect(event?.resolutionSourceUrl).toBe('https://example.com/source');
      expect(event?.resolutionNotes).toBe('Resolution notes here');
      expect(event?.realWorldEventTime).toBeDefined();
      expect(event?.resolutionTimeExpected).toBeDefined();
    });

    it('should trim whitespace from title and description', async () => {
      const input = createValidEventInput({
        title: '  Trimmed Title  ',
        description: '  Trimmed Description  ',
      });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(true);

      const event = await prisma.event.findUnique({
        where: { id: result.results[0].eventId! },
      });

      expect(event?.title).toBe('Trimmed Title');
      expect(event?.description).toBe('Trimmed Description');
    });
  });

  describe('Validation - invalid events are rejected', () => {
    it('should reject event with missing title', async () => {
      const input = createValidEventInput({ title: '' });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(false);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.results[0].success).toBe(false);
      expect(result.results[0].errors).toBeDefined();
      expect(result.results[0].errors?.some((e) => e.includes('Title'))).toBe(
        true
      );
    });

    it('should reject event with title too short', async () => {
      const input = createValidEventInput({ title: 'AB' });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(false);
      expect(result.results[0].success).toBe(false);
      expect(
        result.results[0].errors?.some((e) => e.includes('at least 3 characters'))
      ).toBe(true);
    });

    it('should reject event with title too long', async () => {
      const input = createValidEventInput({
        title: 'A'.repeat(501),
      });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(false);
      expect(result.results[0].success).toBe(false);
      expect(
        result.results[0].errors?.some((e) => e.includes('at most 500 characters'))
      ).toBe(true);
    });

    it('should reject event with missing category', async () => {
      const input = createValidEventInput({ category: '' });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(false);
      expect(result.results[0].success).toBe(false);
      expect(
        result.results[0].errors?.some((e) => e.includes('Category'))
      ).toBe(true);
    });

    it('should reject event with closesAt too soon', async () => {
      const input = createValidEventInput({
        closesAt: new Date(now.getTime() + 23 * 60 * 60 * 1000), // 23 hours from now
      });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(false);
      expect(result.results[0].success).toBe(false);
      expect(
        result.results[0].errors?.some((e) => e.includes('at least 24 hours'))
      ).toBe(true);
    });

    it('should reject event with closesAt too far in future', async () => {
      const input = createValidEventInput({
        closesAt: new Date(now.getTime() + (731 * 24 * 60 * 60 * 1000)), // 731 days
      });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(false);
      expect(result.results[0].success).toBe(false);
      expect(
        result.results[0].errors?.some((e) => e.includes('730 days'))
      ).toBe(true);
    });

    it('should reject event with invalid b parameter', async () => {
      const input = createValidEventInput({ b: -1 });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(false);
      expect(result.results[0].success).toBe(false);
      expect(
        result.results[0].errors?.some((e) => e.includes('b (LMSR parameter)'))
      ).toBe(true);
    });

    it('should reject event with b too large', async () => {
      const input = createValidEventInput({ b: 100001 });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(false);
      expect(result.results[0].success).toBe(false);
      expect(
        result.results[0].errors?.some((e) => e.includes('between 1 and 100000'))
      ).toBe(true);
    });

    it('should reject event with invalid time coherence', async () => {
      const realWorldEventTime = new Date(now.getTime() + 30 * 60 * 60 * 1000);
      const closesAt = new Date(realWorldEventTime.getTime() + 60 * 60 * 1000); // After realWorldEventTime (invalid)

      const input = createValidEventInput({
        closesAt,
        realWorldEventTime,
        category: 'Sport', // Buffer is 1 hour
      });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(false);
      expect(result.results[0].success).toBe(false);
      expect(
        result.results[0].errors?.some((e) => e.includes('Time coherence'))
      ).toBe(true);
    });

    it('should reject event with realWorldEventTime in the past', async () => {
      const input = createValidEventInput({
        realWorldEventTime: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
      });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(false);
      expect(result.results[0].success).toBe(false);
      expect(
        result.results[0].errors?.some((e) => e.includes('cannot be in the past'))
      ).toBe(true);
    });

    it('should reject event with invalid resolutionTimeExpected', async () => {
      const realWorldEventTime = new Date(now.getTime() + 30 * 60 * 60 * 1000);
      const resolutionTimeExpected = new Date(
        realWorldEventTime.getTime() - 60 * 60 * 1000
      ); // Before realWorldEventTime (invalid)

      const input = createValidEventInput({
        realWorldEventTime,
        resolutionTimeExpected,
      });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(false);
      expect(result.results[0].success).toBe(false);
      expect(
        result.results[0].errors?.some((e) =>
          e.includes('resolutionTimeExpected')
        )
      ).toBe(true);
    });

    it('should reject event with negative resolutionBufferHours', async () => {
      const input = createValidEventInput({
        resolutionBufferHours: -1,
      });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(false);
      expect(result.results[0].success).toBe(false);
      expect(
        result.results[0].errors?.some((e) =>
          e.includes('resolutionBufferHours must be positive')
        )
      ).toBe(true);
    });

    it('should reject multiple invalid events', async () => {
      const inputs: EventInput[] = [
        createValidEventInput({ title: '' }), // Invalid
        createValidEventInput({ category: '' }), // Invalid
        createValidEventInput({ title: 'Valid Event' }), // Valid
      ];

      const result = await runPipelineV2(inputs);

      expect(result.allSuccessful).toBe(false);
      expect(result.total).toBe(3);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(2);
      expect(result.results[0].success).toBe(false);
      expect(result.results[1].success).toBe(false);
      expect(result.results[2].success).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Use a non-existent user ID to trigger foreign key constraint error
      const input = createValidEventInput({
        createdById: 'non-existent-user-id',
      });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(false);
      expect(result.results[0].success).toBe(false);
      expect(result.results[0].error).toBeDefined();
    });

    it('should handle errors without crashing', async () => {
      const inputs: EventInput[] = [
        createValidEventInput({ title: 'Valid Event' }),
        createValidEventInput({
          createdById: 'non-existent-user-id',
        }), // Will cause error
        createValidEventInput({ title: 'Another Valid Event' }),
      ];

      const result = await runPipelineV2(inputs, {
        useTransaction: false, // Don't use transaction so we can see partial success
      });

      // First event should succeed, second should fail, third should succeed
      expect(result.total).toBe(3);
      expect(result.successful).toBeGreaterThan(0);
      expect(result.failed).toBeGreaterThan(0);
    });
  });

  describe('Transaction behavior', () => {
    it('should use transaction by default', async () => {
      const inputs: EventInput[] = [
        createValidEventInput({ title: 'Event 1' }),
        createValidEventInput({ title: 'Event 2' }),
      ];

      const result = await runPipelineV2(inputs);

      expect(result.allSuccessful).toBe(true);
      // Both events should be created atomically
      const events = await prisma.event.findMany({
        where: { createdById: testUser.id },
      });
      expect(events).toHaveLength(2);
    });

    it('should rollback transaction on error when stopOnError is true', async () => {
      const inputs: EventInput[] = [
        createValidEventInput({ title: 'Valid Event 1' }),
        createValidEventInput({
          createdById: 'non-existent-user-id',
        }), // Will cause error
        createValidEventInput({ title: 'Valid Event 2' }),
      ];

      const result = await runPipelineV2(inputs, {
        useTransaction: true,
        stopOnError: true,
      });

      expect(result.allSuccessful).toBe(false);
      // Transaction should rollback, so no events should be created
      const events = await prisma.event.findMany({
        where: { createdById: testUser.id },
      });
      expect(events).toHaveLength(0);
    });

    it('should not use transaction when useTransaction is false', async () => {
      const inputs: EventInput[] = [
        createValidEventInput({ title: 'Event 1' }),
        createValidEventInput({ title: 'Event 2' }),
      ];

      const result = await runPipelineV2(inputs, {
        useTransaction: false,
      });

      expect(result.allSuccessful).toBe(true);
      const events = await prisma.event.findMany({
        where: { createdById: testUser.id },
      });
      expect(events).toHaveLength(2);
    });
  });

  describe('stopOnError option', () => {
    it('should stop on first validation error when stopOnError is true', async () => {
      const inputs: EventInput[] = [
        createValidEventInput({ title: '' }), // Invalid
        createValidEventInput({ title: 'Valid Event' }), // Should not be processed
      ];

      const result = await runPipelineV2(inputs, {
        stopOnError: true,
      });

      expect(result.total).toBe(2);
      expect(result.results).toHaveLength(1); // Only first event processed
      expect(result.results[0].success).toBe(false);
    });

    it('should continue processing when stopOnError is false', async () => {
      const inputs: EventInput[] = [
        createValidEventInput({ title: '' }), // Invalid
        createValidEventInput({ title: 'Valid Event' }), // Should be processed
      ];

      const result = await runPipelineV2(inputs, {
        stopOnError: false,
      });

      expect(result.total).toBe(2);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(false);
      expect(result.results[1].success).toBe(true);
    });
  });

  describe('Logger functionality', () => {
    it('should call logger function', async () => {
      const logMessages: string[] = [];
      const logger = (message: string, ...args: unknown[]) => {
        logMessages.push(message);
      };

      const input = createValidEventInput({ title: 'Test Event' });

      await runPipelineV2([input], { logger });

      expect(logMessages.length).toBeGreaterThan(0);
      expect(
        logMessages.some((msg) => msg.includes('[PIPELINE START]'))
      ).toBe(true);
      expect(
        logMessages.some((msg) => msg.includes('[PIPELINE COMPLETE]'))
      ).toBe(true);
    });
  });

  describe('Created events are complete and valid', () => {
    it('should create events with all required fields', async () => {
      const input = createValidEventInput({
        title: 'Complete Event',
        category: 'Tecnologia',
        b: 500,
        resolutionBufferHours: 12,
      });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(true);

      const event = await prisma.event.findUnique({
        where: { id: result.results[0].eventId! },
      });

      expect(event).toBeDefined();
      expect(event?.title).toBe('Complete Event');
      expect(event?.category).toBe('Tecnologia');
      expect(event?.closesAt).toBeInstanceOf(Date);
      expect(event?.createdById).toBe(testUser.id);
      expect(event?.b).toBe(500);
      expect(event?.resolutionBufferHours).toBe(12);
      expect(event?.resolutionStatus).toBe('PENDING');
      expect(event?.resolved).toBe(false);
      expect(event?.createdAt).toBeInstanceOf(Date);
      expect(event?.updatedAt).toBeInstanceOf(Date);
    });

    it('should set default resolutionBufferHours when not provided', async () => {
      const input = createValidEventInput({
        resolutionBufferHours: undefined,
      });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(true);

      const event = await prisma.event.findUnique({
        where: { id: result.results[0].eventId! },
      });

      expect(event?.resolutionBufferHours).toBe(24); // Default value
    });

    it('should handle null optional fields correctly', async () => {
      const input = createValidEventInput({
        description: null,
        resolutionSourceUrl: null,
        resolutionNotes: null,
        realWorldEventTime: null,
        resolutionTimeExpected: null,
      });

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(true);

      const event = await prisma.event.findUnique({
        where: { id: result.results[0].eventId! },
      });

      expect(event?.description).toBeNull();
      expect(event?.resolutionSourceUrl).toBeNull();
      expect(event?.resolutionNotes).toBeNull();
      expect(event?.realWorldEventTime).toBeNull();
      expect(event?.resolutionTimeExpected).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty input array', async () => {
      const result = await runPipelineV2([]);

      expect(result.total).toBe(0);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(0);
      expect(result.allSuccessful).toBe(true);
    });

    it('should handle events with exactly minimum title length', async () => {
      const input = createValidEventInput({ title: 'ABC' }); // Exactly 3 characters

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(true);
      expect(result.results[0].success).toBe(true);
    });

    it('should handle events with exactly maximum title length', async () => {
      const input = createValidEventInput({ title: 'A'.repeat(500) }); // Exactly 500 characters

      const result = await runPipelineV2([input]);

      expect(result.allSuccessful).toBe(true);
      expect(result.results[0].success).toBe(true);
    });

    it('should handle events with closesAt exactly 24 hours from now', async () => {
      const closesAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const input = createValidEventInput({ closesAt });

      const result = await runPipelineV2([input], {
        logger: () => {}, // Suppress logs
      });

      // Should pass validation (24 hours is the minimum)
      expect(result.allSuccessful).toBe(true);
    });

    it('should handle events with closesAt exactly 730 days from now', async () => {
      const closesAt = new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000);
      const input = createValidEventInput({ closesAt });

      const result = await runPipelineV2([input]);

      // Should pass validation (730 days is the maximum)
      expect(result.allSuccessful).toBe(true);
    });
  });
});
