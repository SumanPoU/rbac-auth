// src/lib/auditLogger.ts
import { db } from "@/lib/prisma";
import winston from "winston";
import fs from "fs";
import path from "path";

// Ensure logs directory exists

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Winston Logger (File + Console in Dev)

const auditLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "audit.log"),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
    ...(process.env.NODE_ENV !== "production"
      ? [new winston.transports.Console({ format: winston.format.simple() })]
      : []),
  ],
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

  // 1. Attempt DB Logging
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

  // 2. Always write to file
  try {
    auditLogger.info("Audit event", {
      ...entry,
      timestamp: new Date().toISOString(),
      dbError: dbError?.message ?? null,
    });
  } catch (error) {
    console.error("Failed to write audit log to file:", error);
    if (dbError) {
      throw new Error("Audit logging failed for both DB and filesystem");
    }
  }

  // 3. Warning if DB logging failed
  if (dbError) {
    console.warn("Audit event logged to file only (DB failed)");
  }
}

// Predefined actions

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

// Helper: Extract IP + User Agent (App Router)

export function getClientInfo(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}
