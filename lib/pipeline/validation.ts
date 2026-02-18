/**
 * Validation functions for event generation pipeline
 */

import type { EventInput, ValidationResult } from "./types";
import { validateTimeCoherence, type Category } from "@/lib/markets";

/**
 * Minimum hours from now for closesAt (default: 24 hours)
 */
const DEFAULT_MIN_HOURS_FROM_NOW = 24;

/**
 * Maximum horizon in days for events (default: 730 days = 2 years)
 */
const MAX_HORIZON_DAYS = 730;

/**
 * Validates an event input before creation
 * 
 * Checks:
 * 1. Required fields (title, category, closesAt, createdById, b)
 * 2. Field constraints (non-empty strings, valid dates, positive numbers)
 * 3. Time coherence (if realWorldEventTime is provided)
 * 4. Business rules (closesAt in future, reasonable b value)
 * 
 * @param input Event input to validate
 * @param now Current time (defaults to now)
 * @returns Validation result with errors if any
 */
export function validateEvent(
  input: EventInput,
  now: Date = new Date()
): ValidationResult {
  const errors: string[] = [];

  // 1. Required fields
  if (!input.title || typeof input.title !== "string" || input.title.trim().length === 0) {
    errors.push("Title is required and must be a non-empty string");
  }

  if (!input.category || typeof input.category !== "string" || input.category.trim().length === 0) {
    errors.push("Category is required and must be a non-empty string");
  }

  if (!input.closesAt || !(input.closesAt instanceof Date) || isNaN(input.closesAt.getTime())) {
    errors.push("closesAt is required and must be a valid Date");
  }

  if (!input.createdById || typeof input.createdById !== "string" || input.createdById.trim().length === 0) {
    errors.push("createdById is required and must be a non-empty string");
  }

  if (typeof input.b !== "number" || isNaN(input.b) || input.b <= 0) {
    errors.push("b (LMSR parameter) is required and must be a positive number");
  }

  // Early return if basic required fields are missing
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // 2. Field constraints
  if (input.title.trim().length < 3) {
    errors.push("Title must be at least 3 characters long");
  }

  if (input.title.length > 500) {
    errors.push("Title must be at most 500 characters long");
  }

  if (input.description && input.description.length > 5000) {
    errors.push("Description must be at most 5000 characters long");
  }

  // 3. Time constraints
  const closesAt = input.closesAt as Date;
  const minCloseTime = new Date(now.getTime() + DEFAULT_MIN_HOURS_FROM_NOW * 60 * 60 * 1000);
  
  if (closesAt.getTime() < minCloseTime.getTime()) {
    errors.push(
      `closesAt (${closesAt.toISOString()}) must be at least ${DEFAULT_MIN_HOURS_FROM_NOW} hours from now. ` +
      `Minimum allowed: ${minCloseTime.toISOString()}`
    );
  }

  const maxHorizon = new Date(now.getTime() + MAX_HORIZON_DAYS * 24 * 60 * 60 * 1000);
  if (closesAt.getTime() > maxHorizon.getTime()) {
    errors.push(
      `closesAt (${closesAt.toISOString()}) cannot be more than ${MAX_HORIZON_DAYS} days in the future. ` +
      `Maximum allowed: ${maxHorizon.toISOString()}`
    );
  }

  // 4. Time coherence validation (if realWorldEventTime is provided)
  if (input.realWorldEventTime) {
    const realWorldEventTime = input.realWorldEventTime;
    
    if (!(realWorldEventTime instanceof Date) || isNaN(realWorldEventTime.getTime())) {
      errors.push("realWorldEventTime must be a valid Date if provided");
    } else {
      // Validate time coherence using the time-coherence utility
      const timeCoherenceResult = validateTimeCoherence(
        closesAt,
        realWorldEventTime,
        input.category as Category
      );

      if (!timeCoherenceResult.ok) {
        errors.push(`Time coherence validation failed: ${timeCoherenceResult.reason}`);
      }

      // Additional check: realWorldEventTime should be in the future
      if (realWorldEventTime.getTime() < now.getTime()) {
        errors.push(
          `realWorldEventTime (${realWorldEventTime.toISOString()}) cannot be in the past`
        );
      }

      // Check resolutionTimeExpected if provided
      if (input.resolutionTimeExpected) {
        const resolutionTimeExpected = input.resolutionTimeExpected;
        
        if (!(resolutionTimeExpected instanceof Date) || isNaN(resolutionTimeExpected.getTime())) {
          errors.push("resolutionTimeExpected must be a valid Date if provided");
        } else {
          if (resolutionTimeExpected.getTime() < realWorldEventTime.getTime()) {
            errors.push(
              `resolutionTimeExpected (${resolutionTimeExpected.toISOString()}) must be >= realWorldEventTime (${realWorldEventTime.toISOString()})`
            );
          }
        }
      }
    }
  }

  // 5. Business rules
  // b should be reasonable (typically between 1 and 10000 for LMSR)
  if (input.b < 1 || input.b > 100000) {
    errors.push("b (LMSR parameter) should be between 1 and 100000");
  }

  // resolutionBufferHours should be positive if provided
  if (input.resolutionBufferHours !== undefined && input.resolutionBufferHours <= 0) {
    errors.push("resolutionBufferHours must be positive if provided");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates multiple events and returns results for each
 * 
 * @param inputs Array of event inputs to validate
 * @param now Current time (defaults to now)
 * @returns Array of validation results, one per input
 */
export function validateEvents(
  inputs: EventInput[],
  now: Date = new Date()
): ValidationResult[] {
  return inputs.map((input) => validateEvent(input, now));
}
