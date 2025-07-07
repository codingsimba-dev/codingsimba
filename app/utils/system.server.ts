import { logEvent } from "./audit-log.server";
import { EntityType } from "./audit-log.server";
import { AuditSeverity } from "~/generated/prisma";

/**
 * Convenience function for logging system events
 */
export async function logSystemEvent({
  action,
  description,
  severity = "INFO",
  metadata,
  ipAddress,
  userAgent,
}: {
  action: string;
  description: string;
  severity?: AuditSeverity;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  await logEvent({
    action,
    category: "SYSTEM",
    module: "SYSTEM",
    description,
    severity,
    entityType: EntityType.SYSTEM,
    metadata,
    ipAddress,
    userAgent,
  });
}

export enum SystemAction {
  SIGNIN = "SIGNIN",
  SIGNOUT = "SIGNOUT",
  SIGNUP = "SIGNUP",
  SUBSCRIPTION = "SUBSCRIPTION",
  SYSTEM_UPDATE = "SYSTEM_UPDATE",
  SYSTEM_MAINTENANCE = "SYSTEM_MAINTENANCE",
  SYSTEM_ERROR = "SYSTEM_ERROR",
}
