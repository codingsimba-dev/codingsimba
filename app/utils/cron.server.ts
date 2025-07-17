/**
 * @fileoverview Cron job utilities for automated maintenance tasks
 *
 * This module provides a centralized system for managing scheduled maintenance tasks
 * that run automatically at specified intervals. It includes job definitions, execution
 * logic, and management functions for enabling/disabling jobs.
 *
 * @example
 * ```typescript
 * // Run all enabled cron jobs
 * const results = await runCronJobs();
 *
 * // Get list of configured jobs
 * const jobs = getCronJobs();
 *
 * // Disable a specific job
 * setCronJobEnabled('log-cleanup', false);
 * ```
 */

import { logSystemEvent, SystemAction } from "./system.server";

/**
 * Represents a scheduled maintenance job
 */
interface CronJob {
  /** Unique identifier for the job */
  name: string;
  /** Cron expression defining when the job should run (e.g., "0 2 * * *" for daily at 2 AM) */
  schedule: string;
  /** Async function that performs the actual job work */
  handler: () => Promise<void>;
  /** Whether the job is currently enabled and should run */
  enabled: boolean;
}

// const { NODE_ENV } = process.env;
// const isProduction = NODE_ENV === "production";

/**
 * Array of all configured cron jobs
 *
 * Each job defines:
 * - name: Unique identifier
 * - schedule: Cron expression for timing
 * - handler: Async function to execute
 * - enabled: Whether the job is active
 *
 * Current Schedule:
 * - Session Cleanup: Daily at 1 AM UTC
 * - Log Cleanup: Daily at 2 AM UTC
 * - Database Maintenance: Weekly on Sunday at 3 AM UTC
 *
 * Note: Health checks are handled by the admin dashboard and don't need cron jobs
 */
const cronJobs: CronJob[] = [
  {
    name: "log-cleanup",
    schedule: "0 2 * * *", // Daily at 2 AM UTC
    handler: async () => {
      /**
       * TODO: Add log cleanup tasks here
       * Potential tasks:
       * - Clean up old logs
       * - Clean up logs that have no user
       * - Clean up logs that have no active connections
       * - Clean up logs that have no active connections
       */
    },
    enabled: true,
  },
  {
    name: "session-cleanup",
    schedule: "0 1 * * *", // Daily at 1 AM UTC
    handler: async () => {
      /**
       * TODO: Add session cleanup tasks here
       * Potential tasks:
       * - Clean up expired sessions
       * - Clean up orphaned sessions
       * - Clean up sessions that have no user
       * - Clean up sessions that have no active connections
       * - Clean up sessions that have no active connections
       */
    },
    enabled: true,
  },

  {
    name: "database-maintenance",
    schedule: "0 3 * * 0", // Weekly on Sunday at 3 AM UTC
    handler: async () => {
      console.log("Running database maintenance...");
      /**
       * TODO: Add database maintenance tasks here
       * Potential tasks:
       * - ANALYZE tables for query optimization
       * - Clean up orphaned records
       * - Update database statistics
       * - Vacuum/optimize tables
       */
      await logSystemEvent({
        action: SystemAction.SYSTEM_MAINTENANCE,
        description: "Weekly database maintenance completed",
      });
    },
    enabled: true,
  },
];

/**
 * Executes all enabled cron jobs sequentially
 *
 * This function should be called by your external cron job scheduler (e.g., system cron,
 * GitHub Actions, or a dedicated cron service). It runs each enabled job and handles
 * errors gracefully, logging failures to the system audit trail.
 *
 * @returns Promise<Array<{job: string, status: 'success' | 'error', error?: string}>>
 *          Array of results for each job execution
 *
 * @example
 * ```typescript
 * // Run all jobs and handle results
 * const results = await runCronJobs();
 *
 * results.forEach(result => {
 *   if (result.status === 'error') {
 *     console.error(`Job ${result.job} failed:`, result.error);
 *   }
 * });
 * ```
 *
 * @throws {Error} If there's an issue with the cron job execution system itself
 */
export async function runCronJobs() {
  const results: Array<{
    job: string;
    status: "success" | "error";
    error?: string;
  }> = [];

  for (const job of cronJobs) {
    // Skip disabled jobs
    if (!job.enabled) {
      console.log(`Skipping disabled cron job: ${job.name}`);
      continue;
    }

    try {
      console.log(`Running cron job: ${job.name}`);
      await job.handler();
      results.push({ job: job.name, status: "success" });
    } catch (error) {
      console.error(`Cron job ${job.name} failed:`, error);
      results.push({ job: job.name, status: "error", error: String(error) });

      // Log the failure to the system audit trail
      await logSystemEvent({
        action: SystemAction.SYSTEM_ERROR,
        description: `Cron job ${job.name} failed`,
        severity: "ERROR",
        metadata: { error: String(error) },
      });
    }
  }

  return results;
}

/**
 * Retrieves a copy of all configured cron jobs
 *
 * Returns a shallow copy of the cron jobs array to prevent external modification
 * of the internal job definitions.
 *
 * @returns Array<CronJob> Copy of all configured cron jobs
 *
 * @example
 * ```typescript
 * const jobs = getCronJobs();
 * jobs.forEach(job => {
 *   console.log(`${job.name}: ${job.enabled ? 'enabled' : 'disabled'}`);
 * });
 * ```
 */
export function getCronJobs(): CronJob[] {
  return cronJobs.map((job) => ({ ...job }));
}

/**
 * Enables or disables a specific cron job by name
 *
 * Allows runtime control over which jobs are active without restarting the application.
 * This is useful for temporarily disabling problematic jobs or enabling maintenance
 * jobs on demand.
 *
 * @param jobName - The unique name of the job to modify
 * @param enabled - Whether the job should be enabled (true) or disabled (false)
 * @returns boolean - True if the job was found and updated, false if job not found
 *
 * @example
 * ```typescript
 * // Disable log cleanup temporarily
 * const success = setCronJobEnabled('log-cleanup', false);
 * if (success) {
 *   console.log('Log cleanup disabled');
 * } else {
 *   console.log('Job not found');
 * }
 *
 * // Re-enable it later
 * setCronJobEnabled('log-cleanup', true);
 * ```
 */
export function setCronJobEnabled(jobName: string, enabled: boolean): boolean {
  const job = cronJobs.find((j) => j.name === jobName);
  if (job) {
    job.enabled = enabled;
    return true;
  }
  return false;
}
