import { cleanupExpiredLogs } from "~/utils/audit-log.server";
import { logSystemEvent, SystemAction } from "~/utils/system.server";

/**
 * Log cleanup endpoint for automated maintenance
 *
 * This endpoint performs log cleanup operations including:
 * - Removing expired logs
 * - Archiving logs to storage
 * - Compressing archives
 *
 * @returns JSON response with cleanup results
 */
export async function action() {
  try {
    console.log("🚀 Starting log cleanup process...");
    console.log(`Timestamp: ${new Date().toISOString()}`);

    const result = await cleanupExpiredLogs({
      dryRun: false, // Set to false for actual cleanup
      batchSize: 1000,
      archiveToStorage: true,
      compressArchives: true,
    });

    console.log("📊 Cleanup Results:");
    console.log(`  - Logs deleted: ${result.deletedCount}`);
    console.log(`  - Logs archived: ${result.archivedCount}`);
    console.log(`  - Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log("❌ Errors encountered:");
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    await logSystemEvent({
      action: SystemAction.SYSTEM_MAINTENANCE,
      description: `Log cleanup completed - ${result.deletedCount} logs deleted`,
      metadata: {
        deletedCount: result.deletedCount,
        archivedCount: result.archivedCount,
        errors: result.errors,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`✅ Log cleanup completed successfully`);

    return {
      success: true,
      result,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Log cleanup failed:", error);

    await logSystemEvent({
      action: SystemAction.SYSTEM_ERROR,
      description: "Log cleanup failed",
      severity: "ERROR",
      metadata: {
        error: String(error),
        timestamp: new Date().toISOString(),
      },
    });

    return {
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}
