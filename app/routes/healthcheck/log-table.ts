import {
  estimateLogSpaceUsage,
  getLogStatistics,
} from "~/utils/audit-log.server";
import { logSystemEvent, SystemAction } from "~/utils/system.server";

export async function checkLogTable() {
  try {
    console.log("📊 Checking log table health...");
    const stats = await getLogStatistics();
    const spaceUsage = await estimateLogSpaceUsage();

    const logHealth = {
      totalLogs: stats.totalLogs,
      estimatedSizeMB: spaceUsage.estimatedSizeMB,
      dateRange: stats.dateRange,
    };

    let logStatus: "pass" | "warning" = "pass";
    let logMessage = "Log table is healthy";

    if (stats.totalLogs > 100_0000) {
      logStatus = "warning";
      logMessage = "High volume of logs detected";
    }

    if (spaceUsage.estimatedSizeMB > 1000) {
      logStatus = "warning";
      logMessage = "Log table size is large";
    }
    await logSystemEvent({
      action: SystemAction.SYSTEM_MAINTENANCE,
      description: `Log table check completed - Status: ${logStatus}`,
      severity: logStatus === "warning" ? "WARNING" : "INFO",
      metadata: {
        status: logStatus,
        timestamp: new Date().toISOString(),
      },
    });
    return { status: logStatus, message: logMessage, details: logHealth };
  } catch (error) {
    await logSystemEvent({
      action: SystemAction.SYSTEM_MAINTENANCE,
      description: `Log table check failed - Status: fail`,
      severity: "ERROR",
      metadata: {
        status: "fail",
        error: String(error),
        timestamp: new Date().toISOString(),
      },
    });
    return { status: "fail", message: String(error) };
  }
}
