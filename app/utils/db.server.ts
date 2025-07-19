import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { remember } from "@epic-web/remember";
import { styleText } from "node:util";
import { PrismaClient } from "~/generated/prisma/client";
import { invariant } from "./misc";
import fs from "node:fs";
import path from "node:path";

const { NODE_ENV, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, DATABASE_URL } =
  process.env;

const isDev =
  NODE_ENV !== "production" ||
  (NODE_ENV === "production" && process.env.MOCKS === "true");
const DEV_DB = DATABASE_URL?.split("/")[1];
invariant(DEV_DB, "Development database not found.");

const DB_DIR = path.join(process.cwd(), "prisma/schema");

export const DEV_DB_URL = `file:${path.join(DB_DIR, DEV_DB)}`;

if (isDev) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const LOCAL_DB_URL = "file:/app/data/local.db";

const databaseConfig = isDev
  ? { url: DEV_DB_URL }
  : {
      url: LOCAL_DB_URL,
      syncUrl: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
      syncInterval: 60,
    };

const adapter = new PrismaLibSQL(databaseConfig);
const queryStats = new Map<string, { count: number; totalDuration: number }>();

export const prisma = remember("prisma", () => {
  const logThreshold = 20;
  let queryCount = 0;
  let startTime = Date.now();
  const client = new PrismaClient({
    adapter,
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
  });

  client.$on("query", async (e) => {
    queryCount++;
    const duration = e.duration;

    const queryKey = e.query.split(/\s+/).slice(0, 3).join(" ");
    const stats = queryStats.get(queryKey) || { count: 0, totalDuration: 0 };
    stats.count++;
    stats.totalDuration += duration;
    queryStats.set(queryKey, stats);

    if (duration < logThreshold) return;

    const color =
      duration < logThreshold * 1.1
        ? "green"
        : duration < logThreshold * 1.2
          ? "blue"
          : duration < logThreshold * 1.3
            ? "yellow"
            : duration < logThreshold * 1.4
              ? "redBright"
              : "red";
    const dur = styleText(color, `${duration}ms`);
    console.info(`prisma:query - ${dur} - ${e.query}`);
  });

  setInterval(() => {
    const elapsed = Date.now() - startTime;
    if (queryCount > 0) {
      console.info("\n=== Query Summary ===");
      console.info(`Total queries: ${queryCount}`);
      console.info(
        `Queries per second: ${(queryCount / (elapsed / 1000)).toFixed(2)}`,
      );
      console.info("\nQuery Patterns:");
      for (const [pattern, stats] of queryStats.entries()) {
        console.info(
          `${pattern}: ${stats.count} queries, avg ${(stats.totalDuration / stats.count).toFixed(2)}ms`,
        );
      }
      console.info("===================\n");
      queryCount = 0;
      startTime = Date.now();
      queryStats.clear();
    }
  }, 5000);
  void client.$connect();
  return client;
});
