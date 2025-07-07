import { prisma } from "~/utils/db.server";
import { logSystemEvent, SystemAction } from "~/utils/system.server";

export async function checkDbConnection() {
  let status: "pass" | "fail" = "pass";
  try {
    console.log("🔌 Checking database connectivity...");
    await prisma.$queryRaw`SELECT 1`;
    await logSystemEvent({
      action: SystemAction.SYSTEM_MAINTENANCE,
      description: `Database connection check completed - Status: ${status}`,
      severity: "INFO",
      metadata: {
        status,
        timestamp: new Date().toISOString(),
      },
    });
    return { status, message: "Database connection is healthy" };
  } catch (error) {
    status = "fail";
    await logSystemEvent({
      action: SystemAction.SYSTEM_MAINTENANCE,
      description: `Database connection check completed - Status: ${status}`,
      severity: "ERROR",
      metadata: {
        status,
        timestamp: new Date().toISOString(),
      },
    });
    return { status: "fail", message: String(error) };
  }
}
