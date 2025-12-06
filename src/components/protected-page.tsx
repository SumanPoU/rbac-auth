"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface ProtectedPageProps {
  permission?: string;
  pageSlug?: string;
  children: React.ReactNode;
}

export default function ProtectedPage({
  permission,
  pageSlug,
  children,
}: ProtectedPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    const user = session?.user;

    if (!user) {
      toast.error("You must login to access this page.");
      router.push("/unauthorized");
      return;
    }

    const hasPermission = permission
      ? user.permissions?.includes(permission)
      : true;

    const hasPageAccess = pageSlug
      ? user.pages?.some((p: any) => p.slug === pageSlug)
      : true;

    if (!hasPermission || !hasPageAccess) {
      toast.error("You are not authorized to access this page.");
      router.push("/unauthorized");
    }
  }, [status, session, permission, pageSlug, router]);

  if (status === "loading") return null;

  return <>{children}</>;
}
