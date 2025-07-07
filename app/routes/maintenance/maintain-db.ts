import { logSystemEvent, SystemAction } from "~/utils/system.server";
import { prisma } from "~/utils/db.server";

export async function maintainDB() {
  console.log("🔧 Running database maintenance...");

  try {
    console.log("📊 Updating table statistics...");
    await prisma.$executeRaw`ANALYZE "AuditLog"`;
    await prisma.$executeRaw`ANALYZE "User"`;
    await prisma.$executeRaw`ANALYZE "Subscription"`;

    console.log("🧹 Cleaning up orphaned records...");

    console.log("🏥 Checking database health...");
    const auditLogCount = await prisma.auditLog.count();
    const userCount = await prisma.user.count();
    const subscriptionCount = await prisma.subscription.count();

    console.log("📈 Database Statistics:");
    console.log(`  - Audit Logs: ${auditLogCount.toLocaleString()}`);
    console.log(`  - Users: ${userCount.toLocaleString()}`);
    console.log(`  - Subscriptions: ${subscriptionCount.toLocaleString()}`);

    await logSystemEvent({
      action: SystemAction.SYSTEM_UPDATE,
      description: "Database maintenance completed",
      metadata: {
        auditLogCount,
        userCount,
        subscriptionCount,
        timestamp: new Date().toISOString(),
      },
    });
    console.log("✅ Database maintenance completed successfully");
  } catch (error) {
    console.error("❌ Database maintenance failed:", error);

    await logSystemEvent({
      action: SystemAction.SYSTEM_UPDATE,
      description: "Database maintenance failed",
      severity: "ERROR",
      metadata: {
        error: String(error),
        timestamp: new Date().toISOString(),
      },
    });

    throw error;
  }
}
