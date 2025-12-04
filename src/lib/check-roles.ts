import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);

  if (!session) return { allowed: false, session: null };

  const userRole = session.user.role;

  if (!allowedRoles.includes(userRole)) {
    return { allowed: false, session };
  }

  return { allowed: true, session };
}
