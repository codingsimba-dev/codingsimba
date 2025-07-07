import {
  cleanupExpiredSessions,
  getExpiredSessionStats,
} from "~/utils/session.server.js";
import { logSystemEvent, SystemAction } from "~/utils/system.server";

/**
 * Session cleanup endpoint for automated maintenance
 *
 * This endpoint performs session cleanup operations including:
 * - Checking expired session statistics
 * - Removing expired sessions
 * - Logging cleanup results
 *
 * @returns JSON response with cleanup results
 */
export async function action() {
  try {
    console.log("🔍 Checking expired sessions...");

    const stats = await getExpiredSessionStats();
    if ("error" in stats) {
      console.error("❌ Failed to get session stats:", stats.error);
      throw new Error(stats.error);
    }

    console.log(`📊 Session Statistics:`);
    console.log(`   Total sessions: ${stats.totalCount}`);
    console.log(`   Expired sessions: ${stats.expiredCount}`);

    if (stats.expiredCount === 0) {
      console.log("✅ No expired sessions to clean up");

      await logSystemEvent({
        action: SystemAction.SYSTEM_MAINTENANCE,
        description: "Session cleanup completed - no expired sessions found",
        metadata: {
          totalSessions: stats.totalCount,
          expiredSessions: stats.expiredCount,
          timestamp: new Date().toISOString(),
        },
      });

      return {
        success: true,
        message: "No expired sessions to clean up",
        stats,
        timestamp: new Date().toISOString(),
      };
    }

    console.log(`\n🧹 Cleaning up ${stats.expiredCount} expired sessions...`);

    const result = await cleanupExpiredSessions();

    if (result.success) {
      console.log(
        `✅ Successfully cleaned up ${result.deletedCount} expired sessions`,
      );

      await logSystemEvent({
        action: SystemAction.SYSTEM_MAINTENANCE,
        description: `Session cleanup completed - ${result.deletedCount} sessions deleted`,
        metadata: {
          totalSessions: stats.totalCount,
          expiredSessions: stats.expiredCount,
          deletedSessions: result.deletedCount,
          timestamp: new Date().toISOString(),
        },
      });

      return {
        success: true,
        result,
        stats,
        timestamp: new Date().toISOString(),
      };
    } else {
      console.error("❌ Failed to cleanup expired sessions:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("❌ Session cleanup failed:", error);

    await logSystemEvent({
      action: SystemAction.SYSTEM_ERROR,
      description: "Session cleanup failed",
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
