/**
 * Integration test script for event generation pipeline
 * 
 * This script performs end-to-end testing:
 * 1. Executes purge to clean the database
 * 2. Executes runPipelineV2 to generate events
 * 3. Verifies that created events are valid
 * 4. Verifies that there are no orphaned data
 * 
 * Usage: tsx scripts/test-pipeline.ts
 */

import { prisma } from "@/lib/prisma";
import { runPipelineV2 } from "@/lib/pipeline/runPipelineV2";
import type { EventInput } from "@/lib/pipeline/types";
import { validateEvent } from "@/lib/pipeline/validation";

/**
 * Attempts to import and execute the purge function
 * Returns true if purge was executed successfully, false otherwise
 */
async function executePurge(): Promise<boolean> {
  try {
    // Attempt to import purge function
    // Note: This assumes purge-all.ts exports a purgeAll function
    // If purge-all.ts doesn't exist yet, we'll handle it gracefully
    const purgeModule = await import("./purge-all");
    const purgeAll = purgeModule.purgeAll || purgeModule.default;
    
    if (typeof purgeAll === "function") {
      await purgeAll();
      return true;
    } else {
      console.warn("[WARNING] purge-all.ts does not export a purgeAll function");
      return false;
    }
  } catch (error) {
    // Module not found or other import error
    if (
      error instanceof Error &&
      (error.message.includes("Cannot find module") ||
        error.message.includes("ENOENT"))
    ) {
      console.warn("[WARNING] purge-all.ts not found. Skipping purge step.");
      console.warn("  Run 'npm run purge' separately if you want to clean the database first.");
    } else {
      console.warn("[WARNING] Failed to import purge-all.ts:", error);
    }
    return false;
  }
}

/**
 * Test data for event generation
 */
function createTestEventInputs(createdById: string): EventInput[] {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  return [
    {
      title: "Test Event: Tecnologia",
      description: "Test event for technology category",
      category: "Tecnologia",
      closesAt: tomorrow,
      createdById,
      b: 100,
      resolutionBufferHours: 12,
      resolutionSourceUrl: "https://example.com/resolution",
      resolutionNotes: "Test resolution notes",
      realWorldEventTime: new Date(tomorrow.getTime() + 13 * 60 * 60 * 1000), // 13h after close
      resolutionTimeExpected: new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000), // 14h after close
    },
    {
      title: "Test Event: Sport",
      description: "Test event for sports category",
      category: "Sport",
      closesAt: nextWeek,
      createdById,
      b: 50,
      resolutionBufferHours: 1,
      resolutionSourceUrl: "https://example.com/sport-resolution",
      resolutionNotes: "Sport event resolution notes",
      realWorldEventTime: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000), // 2h after close
    },
    {
      title: "Test Event: Economia",
      description: "Test event for economy category with longer buffer",
      category: "Economia",
      closesAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      createdById,
      b: 200,
      resolutionBufferHours: 24,
      resolutionSourceUrl: "https://example.com/economy-resolution",
      resolutionNotes: "Economy event resolution notes",
      realWorldEventTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    },
  ];
}

/**
 * Verifies that all created events are valid
 */
async function verifyCreatedEvents(eventIds: string[]): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  if (eventIds.length === 0) {
    errors.push("No events were created");
    return { valid: false, errors };
  }

  // Fetch all created events
  const events = await prisma.event.findMany({
    where: { id: { in: eventIds } },
    include: {
      createdBy: true,
    },
  });

  if (events.length !== eventIds.length) {
    errors.push(
      `Expected ${eventIds.length} events, but found ${events.length} in database`
    );
  }

  // Verify each event
  for (const event of events) {
    // Check required fields
    if (!event.title || event.title.trim().length === 0) {
      errors.push(`Event ${event.id} has empty title`);
    }

    if (!event.category || event.category.trim().length === 0) {
      errors.push(`Event ${event.id} has empty category`);
    }

    if (!event.createdById) {
      errors.push(`Event ${event.id} has no createdById`);
    }

    if (!event.createdBy) {
      errors.push(`Event ${event.id} has invalid createdBy reference`);
    }

    if (typeof event.b !== "number" || event.b <= 0) {
      errors.push(`Event ${event.id} has invalid b parameter: ${event.b}`);
    }

    // Check time constraints
    const now = new Date();
    if (event.closesAt.getTime() <= now.getTime()) {
      errors.push(
        `Event ${event.id} closesAt (${event.closesAt.toISOString()}) is not in the future`
      );
    }

    // Verify event can be validated using validation function
    const eventInput: EventInput = {
      title: event.title,
      description: event.description || undefined,
      category: event.category,
      closesAt: event.closesAt,
      createdById: event.createdById,
      b: event.b,
      resolutionBufferHours: event.resolutionBufferHours,
      resolutionSourceUrl: event.resolutionSourceUrl || undefined,
      resolutionNotes: event.resolutionNotes || undefined,
      realWorldEventTime: event.realWorldEventTime || undefined,
      resolutionTimeExpected: event.resolutionTimeExpected || undefined,
    };

    const validation = validateEvent(eventInput);
    if (!validation.isValid) {
      errors.push(
        `Event ${event.id} failed validation: ${validation.errors.join(", ")}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Verifies that there are no orphaned data
 */
async function verifyNoOrphanedData(): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  // Get all valid IDs for reference checks
  const [allEventIds, allCommentIds, allUserIds] = await Promise.all([
    prisma.event.findMany({ select: { id: true } }).then((events) => new Set(events.map((e) => e.id))),
    prisma.comment.findMany({ select: { id: true } }).then((comments) => new Set(comments.map((c) => c.id))),
    prisma.user.findMany({ select: { id: true } }).then((users) => new Set(users.map((u) => u.id))),
  ]);

  // Check for predictions with invalid eventId (event doesn't exist)
  const allPredictions = await prisma.prediction.findMany({
    select: { id: true, eventId: true, userId: true },
  });
  const invalidPredictions = allPredictions.filter(
    (p) => !allEventIds.has(p.eventId)
  );
  if (invalidPredictions.length > 0) {
    errors.push(
      `Found ${invalidPredictions.length} prediction(s) with invalid eventId`
    );
  }

  // Check for predictions with invalid userId
  const invalidPredictionsUser = allPredictions.filter(
    (p) => !allUserIds.has(p.userId)
  );
  if (invalidPredictionsUser.length > 0) {
    errors.push(
      `Found ${invalidPredictionsUser.length} prediction(s) with invalid userId`
    );
  }

  // Check for comments with invalid eventId
  const allComments = await prisma.comment.findMany({
    select: { id: true, eventId: true, userId: true },
  });
  const invalidComments = allComments.filter((c) => !allEventIds.has(c.eventId));
  if (invalidComments.length > 0) {
    errors.push(`Found ${invalidComments.length} comment(s) with invalid eventId`);
  }

  // Check for comments with invalid userId
  const invalidCommentsUser = allComments.filter((c) => !allUserIds.has(c.userId));
  if (invalidCommentsUser.length > 0) {
    errors.push(`Found ${invalidCommentsUser.length} comment(s) with invalid userId`);
  }

  // Check for comments with invalid parentId (if parentId is set)
  const commentsWithParent = allComments.filter((c) => c.parentId !== null);
  const invalidParentComments = commentsWithParent.filter(
    (c) => c.parentId && !allCommentIds.has(c.parentId)
  );
  if (invalidParentComments.length > 0) {
    errors.push(`Found ${invalidParentComments.length} comment(s) with invalid parentId`);
  }

  // Check for reactions with invalid commentId
  const allReactions = await prisma.reaction.findMany({
    select: { id: true, commentId: true, userId: true },
  });
  const invalidReactions = allReactions.filter((r) => !allCommentIds.has(r.commentId));
  if (invalidReactions.length > 0) {
    errors.push(`Found ${invalidReactions.length} reaction(s) with invalid commentId`);
  }

  // Check for reactions with invalid userId
  const invalidReactionsUser = allReactions.filter((r) => !allUserIds.has(r.userId));
  if (invalidReactionsUser.length > 0) {
    errors.push(`Found ${invalidReactionsUser.length} reaction(s) with invalid userId`);
  }

  // Check for transactions with invalid userId
  const allTransactions = await prisma.transaction.findMany({
    select: { id: true, userId: true },
  });
  const invalidTransactions = allTransactions.filter((t) => !allUserIds.has(t.userId));
  if (invalidTransactions.length > 0) {
    errors.push(`Found ${invalidTransactions.length} transaction(s) with invalid userId`);
  }

  // Check for notifications with invalid userId
  const allNotifications = await prisma.notification.findMany({
    select: { id: true, userId: true },
  });
  const invalidNotifications = allNotifications.filter((n) => !allUserIds.has(n.userId));
  if (invalidNotifications.length > 0) {
    errors.push(`Found ${invalidNotifications.length} notification(s) with invalid userId`);
  }

  // Check for EventFollower with invalid eventId or userId (if EventFollower model exists)
  try {
    const allEventFollowers = await prisma.eventFollower.findMany({
      select: { id: true, eventId: true, userId: true },
    });
    const invalidEventFollowersEvent = allEventFollowers.filter(
      (ef) => !allEventIds.has(ef.eventId)
    );
    if (invalidEventFollowersEvent.length > 0) {
      errors.push(`Found ${invalidEventFollowersEvent.length} EventFollower(s) with invalid eventId`);
    }

    const invalidEventFollowersUser = allEventFollowers.filter(
      (ef) => !allUserIds.has(ef.userId)
    );
    if (invalidEventFollowersUser.length > 0) {
      errors.push(`Found ${invalidEventFollowersUser.length} EventFollower(s) with invalid userId`);
    }
  } catch (error) {
    // EventFollower model might not exist in all schema versions, ignore
  }

  // Check for events with invalid createdById
  const allEvents = await prisma.event.findMany({
    select: { id: true, createdById: true },
  });
  const invalidEvents = allEvents.filter((e) => !allUserIds.has(e.createdById));
  if (invalidEvents.length > 0) {
    errors.push(`Found ${invalidEvents.length} event(s) with invalid createdById`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Main test function
 */
async function runIntegrationTest() {
  console.log("=".repeat(80));
  console.log("INTEGRATION TEST: Event Generation Pipeline");
  console.log("=".repeat(80));
  console.log();

  let testPassed = true;
  const allErrors: string[] = [];

  try {
    // Step 1: Purge database (if purge function is available)
    console.log("[STEP 1] Attempting to purge database...");
    const purgeExecuted = await executePurge();
    if (purgeExecuted) {
      console.log("✓ Database purged successfully");
    } else {
      console.log("  Note: Purge skipped. This test will use existing data in the database");
    }
    console.log();

    // Step 2: Get or create a test user
    console.log("[STEP 2] Setting up test user...");
    let testUser = await prisma.user.findFirst({
      where: { email: "test-pipeline@example.com" },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: "test-pipeline@example.com",
          name: "Test Pipeline User",
          credits: 1000,
        },
      });
      console.log(`✓ Created test user: ${testUser.id}`);
    } else {
      console.log(`✓ Using existing test user: ${testUser.id}`);
    }
    console.log();

    // Step 3: Generate test event inputs
    console.log("[STEP 3] Generating test event inputs...");
    const testInputs = createTestEventInputs(testUser.id);
    console.log(`✓ Generated ${testInputs.length} test event input(s)`);
    console.log();

    // Step 4: Run pipeline
    console.log("[STEP 4] Running runPipelineV2...");
    const pipelineResult = await runPipelineV2(testInputs, {
      useTransaction: true,
      stopOnError: false,
      logger: (message, ...args) => {
        console.log(`  ${message}`, ...args);
      },
    });

    console.log();
    console.log("Pipeline Results:");
    console.log(`  Total: ${pipelineResult.total}`);
    console.log(`  Successful: ${pipelineResult.successful}`);
    console.log(`  Failed: ${pipelineResult.failed}`);
    console.log(`  All Successful: ${pipelineResult.allSuccessful}`);

    if (!pipelineResult.allSuccessful) {
      testPassed = false;
      console.log();
      console.log("Failed events:");
      pipelineResult.results
        .filter((r) => !r.success)
        .forEach((result) => {
          const errors = result.errors || [result.error || "Unknown error"];
          console.log(`  - "${result.input.title}": ${errors.join(", ")}`);
          allErrors.push(
            `Pipeline failed for "${result.input.title}": ${errors.join(", ")}`
          );
        });
    }
    console.log();

    // Step 5: Verify created events
    console.log("[STEP 5] Verifying created events...");
    const successfulEventIds = pipelineResult.results
      .filter((r) => r.success && r.eventId)
      .map((r) => r.eventId!);

    if (successfulEventIds.length === 0) {
      console.error("✗ No events were created successfully");
      testPassed = false;
      allErrors.push("No events were created successfully");
    } else {
      const verification = await verifyCreatedEvents(successfulEventIds);
      if (verification.valid) {
        console.log(`✓ All ${successfulEventIds.length} event(s) are valid`);
      } else {
        console.error(`✗ Validation failed for ${verification.errors.length} issue(s):`);
        verification.errors.forEach((error) => {
          console.error(`  - ${error}`);
        });
        testPassed = false;
        allErrors.push(...verification.errors);
      }
    }
    console.log();

    // Step 6: Verify no orphaned data
    console.log("[STEP 6] Verifying no orphaned data...");
    const orphanCheck = await verifyNoOrphanedData();
    if (orphanCheck.valid) {
      console.log("✓ No orphaned data found");
    } else {
      console.error(`✗ Found ${orphanCheck.errors.length} orphaned data issue(s):`);
      orphanCheck.errors.forEach((error) => {
        console.error(`  - ${error}`);
      });
      testPassed = false;
      allErrors.push(...orphanCheck.errors);
    }
    console.log();

    // Step 7: Summary
    console.log("=".repeat(80));
    if (testPassed) {
      console.log("✓ INTEGRATION TEST PASSED");
      console.log(`  - Created ${successfulEventIds.length} valid event(s)`);
      console.log(`  - No orphaned data detected`);
      console.log(`  - All validations passed`);
    } else {
      console.log("✗ INTEGRATION TEST FAILED");
      console.log(`  - ${allErrors.length} error(s) found`);
    }
    console.log("=".repeat(80));

    // Exit with appropriate code
    process.exit(testPassed ? 0 : 1);
  } catch (error) {
    console.error();
    console.error("=".repeat(80));
    console.error("✗ INTEGRATION TEST CRASHED");
    console.error("=".repeat(80));
    console.error("Unexpected error:", error);
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  } finally {
    // Close Prisma connection
    await prisma.$disconnect();
  }
}

// Run the test
runIntegrationTest().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
