import cron from "node-cron";
import { logSystemEvent, SystemAction } from "./system.server";
import { spawn } from "node:child_process";

/**
 * Node.js Cron Scheduler for Production
 * Uses node-cron package for reliable job scheduling
 */

interface ScheduledJob {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
  enabled: boolean;
  timezone?: string;
  cronJob?: ReturnType<typeof cron.schedule>;
}

const scheduledJobs: ScheduledJob[] = [
  {
    name: "log-cleanup",
    schedule: "0 2 * * *", // Daily at 2 AM UTC
    handler: async () => {
      try {
        console.log("Running scheduled log cleanup...");
        await runScript("npm", ["run", "cleanup-logs"], "log-cleanup");
        await logSystemEvent({
          action: SystemAction.SYSTEM_UPDATE,
          description: "Daily log cleanup completed successfully",
        });
      } catch (error) {
        console.error("Log cleanup failed:", error);
        await logSystemEvent({
          action: SystemAction.SYSTEM_UPDATE,
          description: "Daily log cleanup failed",
          severity: "ERROR",
          metadata: { error: String(error) },
        });
      }
    },
    enabled: true,
    timezone: "UTC",
  },
  {
    name: "database-maintenance",
    schedule: "0 3 * * 0", // Weekly on Sunday at 3 AM UTC
    handler: async () => {
      try {
        console.log("Running weekly database maintenance...");
        await runScript(
          "npm",
          ["run", "db:maintenance"],
          "database-maintenance",
        );

        await logSystemEvent({
          action: SystemAction.SYSTEM_UPDATE,
          description: "Weekly database maintenance completed",
        });
      } catch (error) {
        console.error("Weekly maintenance failed:", error);
        await logSystemEvent({
          action: SystemAction.SYSTEM_UPDATE,
          description: "Weekly database maintenance failed",
          severity: "ERROR",
          metadata: { error: String(error) },
        });
      }
    },
    enabled: true,
    timezone: "UTC",
  },
  {
    name: "health-check",
    schedule: "*/15 * * * *", // Every 15 minutes
    handler: async () => {
      try {
        console.log("Running health check...");
        await runScript("npm", ["run", "health-check"], "health-check");

        await logSystemEvent({
          action: SystemAction.SYSTEM_UPDATE,
          description: "Health check completed",
          severity: "INFO",
        });
      } catch (error) {
        console.error("Health check failed:", error);
        await logSystemEvent({
          action: SystemAction.SYSTEM_UPDATE,
          description: "Health check failed",
          severity: "ERROR",
          metadata: { error: String(error) },
        });
      }
    },
    enabled: true,
    timezone: "UTC",
  },
];

let schedulerInitialized = false;

/**
 * Run a script using spawn for better streaming and memory management
 */
async function runScript(
  command: string,
  args: string[],
  scriptName: string,
  timeout: number = 300000, // 5 minutes default timeout
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Starting ${scriptName} script...`);

    const childProcess = spawn(command, args, {
      stdio: ["inherit", "pipe", "pipe"],
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV || "production" },
    });

    let hasExited = false;

    // Handle stdout
    childProcess.stdout?.on("data", (data) => {
      const output = data.toString();
      console.log(`[${scriptName}] ${output.trim()}`);
    });

    // Handle stderr
    childProcess.stderr?.on("data", (data) => {
      const output = data.toString();
      console.error(`[${scriptName}] ERROR: ${output.trim()}`);
    });

    // Handle process exit
    childProcess.on("exit", (code, signal) => {
      hasExited = true;

      if (code === 0) {
        console.log(`✅ ${scriptName} completed successfully`);
        resolve();
      } else {
        const error = new Error(
          `${scriptName} failed with code ${code}${signal ? ` and signal ${signal}` : ""}`,
        );
        console.error(`❌ ${scriptName} failed:`, error.message);
        reject(error);
      }
    });

    // Handle process errors
    childProcess.on("error", (error) => {
      hasExited = true;
      console.error(`❌ ${scriptName} process error:`, error);
      reject(error);
    });

    // Set timeout
    const timeoutId = setTimeout(() => {
      if (!hasExited) {
        console.error(`⏰ ${scriptName} timed out after ${timeout}ms`);
        childProcess.kill("SIGTERM");

        // Force kill after 10 seconds
        setTimeout(() => {
          if (!hasExited) {
            childProcess.kill("SIGKILL");
          }
        }, 10000);

        reject(new Error(`${scriptName} timed out after ${timeout}ms`));
      }
    }, timeout);

    // Clear timeout on successful completion
    childProcess.on("exit", () => {
      clearTimeout(timeoutId);
    });
  });
}

/**
 * Initialize the cron scheduler
 * Should be called once when the application starts
 */
export function initializeScheduler() {
  if (schedulerInitialized) {
    console.warn("Scheduler already initialized");
    return;
  }

  console.log("Initializing cron scheduler...");

  scheduledJobs.forEach((job) => {
    if (!job.enabled) {
      console.log(`Skipping disabled job: ${job.name}`);
      return;
    }

    try {
      const cronJob = cron.schedule(
        job.schedule,
        async () => {
          console.log(`Starting scheduled job: ${job.name}`);
          const startTime = Date.now();

          try {
            await job.handler();
            const duration = Date.now() - startTime;
            console.log(`Completed job: ${job.name} (${duration}ms)`);
          } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`Job failed: ${job.name} (${duration}ms)`, error);
          }
        },
        {
          timezone: job.timezone || "UTC",
          scheduled: true,
        },
      );

      console.log(`Scheduled job: ${job.name} (${job.schedule})`);

      // Store reference for potential cleanup
      job.cronJob = cronJob;
    } catch (error) {
      console.error(`Failed to schedule job: ${job.name}`, error);
    }
  });

  schedulerInitialized = true;
  console.log("Cron scheduler initialized successfully");
}

/**
 * Stop all scheduled jobs
 * Useful for graceful shutdown
 */
export function stopScheduler() {
  console.log("Stopping cron scheduler...");

  scheduledJobs.forEach((job) => {
    if (job.cronJob) {
      job.cronJob.stop();
      console.log(`Stopped job: ${job.name}`);
    }
  });

  schedulerInitialized = false;
  console.log("Cron scheduler stopped");
}

/**
 * Get status of all scheduled jobs
 */
export function getSchedulerStatus() {
  return scheduledJobs.map((job) => ({
    name: job.name,
    schedule: job.schedule,
    enabled: job.enabled,
    timezone: job.timezone,
    running: schedulerInitialized && job.enabled,
  }));
}

/**
 * Enable or disable a specific job
 */
export function setJobEnabled(jobName: string, enabled: boolean): boolean {
  const job = scheduledJobs.find((j) => j.name === jobName);
  if (!job) {
    return false;
  }

  job.enabled = enabled;

  if (schedulerInitialized) {
    if (enabled) {
      // Re-initialize the specific job
      const cronJob = cron.schedule(job.schedule, job.handler, {
        timezone: job.timezone || "UTC",
        scheduled: true,
      });
      job.cronJob = cronJob;
    } else {
      // Stop the job
      if (job.cronJob) {
        job.cronJob.stop();
        job.cronJob = undefined;
      }
    }
  }

  return true;
}

/**
 * Add a new scheduled job dynamically
 */
export function addScheduledJob(newJob: Omit<ScheduledJob, "enabled">) {
  const job: ScheduledJob = {
    ...newJob,
    enabled: true,
  };

  scheduledJobs.push(job);

  if (schedulerInitialized && job.enabled) {
    const cronJob = cron.schedule(job.schedule, job.handler, {
      timezone: job.timezone || "UTC",
      scheduled: true,
    });
    job.cronJob = cronJob;
  }

  return job.name;
}

/**
 * Remove a scheduled job
 */
export function removeScheduledJob(jobName: string): boolean {
  const index = scheduledJobs.findIndex((j) => j.name === jobName);
  if (index === -1) {
    return false;
  }

  const job = scheduledJobs[index];

  if (job.cronJob) {
    job.cronJob.stop();
  }

  scheduledJobs.splice(index, 1);
  return true;
}

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, stopping scheduler...");
  stopScheduler();
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, stopping scheduler...");
  stopScheduler();
});
