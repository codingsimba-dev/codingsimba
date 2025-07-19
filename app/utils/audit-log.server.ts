import type {
  AuditCategory,
  AuditSeverity,
  AuditModule,
} from "~/generated/prisma/client";
import { prisma } from "./db.server";
import { logSystemEvent } from "./system.server";

/**
 * Generic event logging function that stores events in the database
 * Uses the existing AuditLog model for comprehensive event tracking
 */
export async function logEvent({
  action,
  category,
  module,
  description,
  severity = "INFO",
  actorId,
  entityType,
  entityId,
  metadata,
  ipAddress,
  userAgent,
  retentionDays = 60, // Default 60 days retention
}: {
  action: string;
  category: AuditCategory;
  module: AuditModule;
  description: string;
  severity?: AuditSeverity;
  actorId?: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  retentionDays?: number;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        category,
        module,
        description,
        severity,
        actorId,
        entityType,
        entityId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        ipAddress,
        userAgent,
        retentionDays,
      },
    });

    // Also log to console for immediate visibility
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      category,
      module,
      description,
      severity,
      actorId,
      entityType,
      entityId,
      metadata,
    };

    switch (severity) {
      case "ERROR":
      case "CRITICAL":
        console.error("Audit log event:", JSON.stringify(logEntry));
        break;
      case "WARNING":
        console.warn("Audit log event:", JSON.stringify(logEntry));
        break;
      case "INFO":
        console.info("Audit log event:", JSON.stringify(logEntry));
        break;
    }
  } catch (error) {
    // Fallback to console logging if database logging fails
    const logEntry = {
      action,
      category,
      module,
      description,
      severity,
      actorId,
      entityType,
      entityId,
      metadata,
    };
    console.error("Failed to log event to database:", error);
    console.log("Event details:", JSON.stringify(logEntry));
  }
}

export enum EntityType {
  USER = "USER",
  TEAM = "TEAM",
  SYSTEM = "SYSTEM",
  CONTENT = "CONTENT",
  COMMENT = "COMMENT",
  LIKE = "LIKE",
  REVIEW = "REVIEW",
  ENROLLMENT = "ENROLLMENT",
  CERTIFICATE = "CERTIFICATE",
  SUBSCRIPTION = "SUBSCRIPTION",
}

/**
 * Log cleanup and archival utilities
 * Handles database space management and log retention policies
 */

interface CleanupOptions {
  dryRun?: boolean;
  batchSize?: number;
  archiveToStorage?: boolean;
  archivePath?: string;
  compressArchives?: boolean;
}

export interface CleanupResult {
  deletedCount: number;
  archivedCount: number;
  errors: string[];
  spaceFreed?: number; // in bytes
}

/**
 * Cleans up expired audit logs based on their retention policy
 */
export async function cleanupExpiredLogs(
  options: CleanupOptions = {},
): Promise<CleanupResult> {
  const {
    dryRun = false,
    batchSize = 1000,
    archiveToStorage = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    compressArchives = true,
  } = options;

  const result: CleanupResult = {
    deletedCount: 0,
    archivedCount: 0,
    errors: [],
  };
  const SIXTY_DAYS_IN_MS = 60 * 24 * 60 * 60 * 1000;

  try {
    // Find logs that have exceeded their retention period
    const expiredLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          // Logs with explicit retention days that have expired
          {
            retentionDays: { not: null },
            createdAt: { lt: new Date(Date.now() - SIXTY_DAYS_IN_MS) },
          },
          // Logs without retention days that are older than 2 months (default)
          {
            retentionDays: null,
            createdAt: { lt: new Date(Date.now() - SIXTY_DAYS_IN_MS) },
          },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: batchSize,
    });

    if (expiredLogs.length === 0) {
      console.log("No expired logs found for cleanup");
      return result;
    }
    console.log(`Found ${expiredLogs.length} expired logs for cleanup`);
    if (dryRun) {
      console.log("DRY RUN: Would delete/archive", expiredLogs.length, "logs");
      return { ...result, deletedCount: expiredLogs.length };
    }

    if (archiveToStorage) {
      const archivedCount = 0;
      //  const result = await archiveLogsToStorage()
      result.archivedCount = archivedCount;
    }

    const deleteResult = await prisma.auditLog.deleteMany({
      where: {
        id: { in: expiredLogs.map((log) => log.id) },
      },
    });
    result.deletedCount = deleteResult.count;
    await logSystemEvent({
      action: "SYSTEM_MAINTENANCE",
      description: `Cleaned up ${result.deletedCount} expired audit logs`,
      metadata: {
        deletedCount: result.deletedCount,
        archivedCount: result.archivedCount,
        batchSize,
        dryRun,
      },
    });

    console.log(`Successfully cleaned up ${result.deletedCount} logs`);
    return result;
  } catch (error) {
    const errorMessage = `Failed to cleanup logs: ${error}`;
    console.error(errorMessage);
    result.errors.push(errorMessage);

    await logSystemEvent({
      action: "ERROR_SIGNED",
      description: "Log cleanup failed",
      severity: "ERROR",
      metadata: { error: String(error) },
    });

    return result;
  }
}

/**
 * Archives logs to JSON files for long-term storage
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function archiveLogsToStorage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logs: any[],
  archivePath: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  compress: boolean = true,
): Promise<number> {
  try {
    /**
     * TODO: Tigris storage
     */
    return 0;
  } catch (error) {
    console.error("Failed to archive logs:", error);
    throw error;
  }
}

/**
 * Gets database statistics for audit logs
 */
export async function getLogStatistics() {
  const totalLogs = await prisma.auditLog.count();

  const logsByAge = await prisma.auditLog.groupBy({
    by: ["severity"],
    _count: { id: true },
  });

  const oldestLog = await prisma.auditLog.findFirst({
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  const newestLog = await prisma.auditLog.findFirst({
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const logsByModule = await prisma.auditLog.groupBy({
    by: ["module"],
    _count: { id: true },
  });

  return {
    totalLogs,
    logsBySeverity: logsByAge,
    logsByModule,
    oldestLog: oldestLog?.createdAt,
    newestLog: newestLog?.createdAt,
    dateRange:
      oldestLog && newestLog
        ? Math.ceil(
            (newestLog.createdAt.getTime() - oldestLog.createdAt.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 0,
  };
}

/**
 * Estimates database space usage for audit logs
 */
export async function estimateLogSpaceUsage(): Promise<{
  estimatedSizeMB: number;
  averageLogSizeBytes: number;
  totalLogs: number;
}> {
  const totalLogs = await prisma.auditLog.count();

  if (totalLogs === 0) {
    return { estimatedSizeMB: 0, averageLogSizeBytes: 0, totalLogs: 0 };
  }

  const sampleLogs = await prisma.auditLog.findMany({
    take: 100,
    select: { id: true, description: true, metadata: true },
  });

  const averageLogSizeBytes =
    sampleLogs.reduce((total, log) => {
      return total + JSON.stringify(log).length;
    }, 0) / sampleLogs.length;

  const estimatedSizeMB = (totalLogs * averageLogSizeBytes) / (1024 * 1024);

  return {
    estimatedSizeMB: Math.round(estimatedSizeMB * 100) / 100,
    averageLogSizeBytes: Math.round(averageLogSizeBytes),
    totalLogs,
  };
}

/**
 * Scheduled cleanup job - can be called by a cron job
 */
export async function scheduledLogCleanup() {
  console.log("Starting scheduled log cleanup...");
  const stats = await getLogStatistics();
  const spaceUsage = await estimateLogSpaceUsage();

  console.log("Current log statistics:", {
    totalLogs: stats.totalLogs,
    estimatedSizeMB: spaceUsage.estimatedSizeMB,
    dateRange: stats.dateRange,
  });

  const result = await cleanupExpiredLogs({
    dryRun: false,
    batchSize: 5000,
    archiveToStorage: true,
    compressArchives: true,
  });
  console.log("Cleanup completed:", result);
  return { ...result, stats, spaceUsage };
}
