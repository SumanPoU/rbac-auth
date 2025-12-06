import { db } from "@/lib/prisma";
import winston from "winston";
import fs from "fs";
import path from "path";

const isVercel = process.env.NODE_PRODUCTION === "vercel";
const isDev = process.env.NODE_PRODUCTION === "dev";

// Transport List

const transports: winston.transport[] = [];

// Only allow file logging in local dev
if (isDev) {
  const logsDir = path.join(process.cwd(), "logs");

  // Ensure logs directory (only in dev)
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "audit.log"),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    })
  );

  transports.push(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Winston Logger

const auditLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports, // Dynamic based on environment
});

// Types

export interface AuditLogEntry {
  userId?: number | null;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Main Logging Function

export async function logAuditEvent(entry: AuditLogEntry) {
  let dbError: Error | null = null;

  // 1. Always log to DB (dev + vercel)
  try {
    await db.auditLog.create({
      data: {
        action: entry.action,
        resource: entry.resource,
        details: entry.details,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        userId: entry.userId ?? null,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    dbError = error as Error;
    console.error("Failed to write audit log to database:", error);
  }

  // 2. Log to file only in local dev
  if (isDev) {
    try {
      auditLogger.info("Audit event", {
        ...entry,
        timestamp: new Date().toISOString(),
        dbError: dbError?.message ?? null,
      });
    } catch (error) {
      console.error("Failed to write audit log to file:", error);
    }
  }

  // 3. Warn if DB logging failed
  if (dbError) {
    console.warn("Audit event logged to file only (DB failed)");
  }
}

// Helper

export const AuditActions = {
  LOGIN: "LOGIN",
  FAILED_LOGIN: "FAILED_LOGIN",
  LOGOUT: "LOGOUT",

  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",

  VIEW: "VIEW",
  EXPORT: "EXPORT",

  ADMIN_ACTION: "ADMIN_ACTION",
  PERMISSION_CHANGE: "PERMISSION_CHANGE",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
} as const;

export function getClientInfo(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}
