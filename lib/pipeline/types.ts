/**
 * Types for runPipelineV2 - Event generation pipeline
 */

import type { Category } from "@/lib/markets";

/**
 * Input data for creating a new event
 */
export interface EventInput {
  /** Event title (required) */
  title: string;
  /** Event description (optional) */
  description?: string | null;
  /** Event category (required) */
  category: Category | string;
  /** When the market closes (required) */
  closesAt: Date;
  /** ID of the user creating the event (required) */
  createdById: string;
  /** LMSR pricing parameter (required) */
  b: number;
  /** Hours before real-world event when market closes (default: 24) */
  resolutionBufferHours?: number;
  /** URL to source for resolution (optional) */
  resolutionSourceUrl?: string | null;
  /** Notes about resolution criteria (optional) */
  resolutionNotes?: string | null;
  /** When the real-world event happens (optional, for time coherence validation) */
  realWorldEventTime?: Date | null;
  /** When resolution is expected (optional, for time coherence validation) */
  resolutionTimeExpected?: Date | null;
}

/**
 * Result of event validation
 */
export interface ValidationResult {
  /** Whether the event is valid */
  isValid: boolean;
  /** List of validation errors (empty if valid) */
  errors: string[];
}

/**
 * Result of creating a single event
 */
export interface EventCreationResult {
  /** Whether the event was created successfully */
  success: boolean;
  /** Created event ID (if successful) */
  eventId?: string;
  /** Validation errors (if failed) */
  errors?: string[];
  /** Error message (if failed) */
  error?: string;
  /** Input data that was attempted */
  input: EventInput;
}

/**
 * Result of running the pipeline
 */
export interface PipelineResult {
  /** Total number of events attempted */
  total: number;
  /** Number of successfully created events */
  successful: number;
  /** Number of failed events */
  failed: number;
  /** Detailed results for each event */
  results: EventCreationResult[];
  /** Overall success (true if all events were created successfully) */
  allSuccessful: boolean;
}

/**
 * Options for running the pipeline
 */
export interface PipelineOptions {
  /** Whether to use a transaction (default: true) */
  useTransaction?: boolean;
  /** Whether to stop on first error (default: false) */
  stopOnError?: boolean;
  /** Custom logger function (default: console.log) */
  logger?: (message: string, ...args: unknown[]) => void;
}
