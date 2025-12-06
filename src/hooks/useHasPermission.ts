import { useSession } from "next-auth/react";

export function useHasPermission(permission: string) {
  const { data: session } = useSession();
  const permissions: string[] = session?.user?.permissions || [];
  return permissions.includes(permission);
}
