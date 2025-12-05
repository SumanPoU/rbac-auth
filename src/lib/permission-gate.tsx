// components/permission-gate.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface PermissionGateProps {
  permission: string; // the permission to check
  userId?: number; // optional: specify userId; if not, use current session
  children: ReactNode;
}

/**
 * Wrap any element with <PermissionGate permission="permission:name" userId={1}>
 * It will only render children if the user has that permission.
 */
export default function PermissionGate({
  permission,
  userId,
  children,
}: PermissionGateProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const userIdFromSession = session?.user?.id;

  useEffect(() => {
    async function checkPermission() {
      try {
        let url = "";

        if (userIdFromSession) {
          // Use the new API with userId
          url = `/api/protected/users/permissions/${userIdFromSession}`;
        } else {
          // fallback for current session user (optional)
          url = `/api/protected/users/permissions/current`;
        }

        // POST request to check specific permission
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permission }),
        });

        const data = await res.json();

        setHasPermission(data.success);
      } catch (error) {
        console.error("PermissionGate error:", error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    }

    checkPermission();
  }, [permission, userId]);

  if (loading) return null; // optionally render a loader

  return hasPermission ? <>{children}</> : null;
}
