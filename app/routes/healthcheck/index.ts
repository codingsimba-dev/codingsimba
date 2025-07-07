import { checkDbConnection } from "./db-connection";
import { checkLogTable } from "./log-table";
import { checkSystemResources } from "./system-resources";

/**
 * Health check endpoint for admin dashboard
 *
 * This endpoint provides health check data for display in the admin dashboard.
 * Individual check functions can be imported and used directly in dashboard components.
 */
export async function loader() {
  // Run all health checks in parallel
  const [dbConnection, logTable, systemResources] = await Promise.all([
    checkDbConnection(),
    checkLogTable(),
    checkSystemResources(),
  ]);

  return {
    dbConnection,
    logTable,
    systemResources,
    timestamp: new Date().toISOString(),
  };
}
