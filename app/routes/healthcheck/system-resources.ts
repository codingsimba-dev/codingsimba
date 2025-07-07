import { logSystemEvent, SystemAction } from "~/utils/system.server";

export async function checkSystemResources() {
  try {
    console.log("💾 Checking system resources...");
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    };

    await logSystemEvent({
      action: SystemAction.SYSTEM_MAINTENANCE,
      description: `System resources check completed - Status: pass`,
      severity: "INFO",
      metadata: {
        status: "pass",
        timestamp: new Date().toISOString(),
      },
    });

    if (memUsageMB.heapUsed > 1000) {
      return {
        status: "warning",
        message: "High memory usage detected",
        details: memUsageMB,
      };
    }

    return {
      status: "pass",
      message: "Memory usage is normal",
      details: memUsageMB,
    };
  } catch (error) {
    await logSystemEvent({
      action: SystemAction.SYSTEM_MAINTENANCE,
      description: `System resources check failed - Status: fail`,
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
