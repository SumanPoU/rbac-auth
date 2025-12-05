"use client";

import { useEffect, useState } from "react";
import { ContentLayout } from "@/components/dashboard/content-layout";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { toast } from "react-hot-toast";
import ProfileForm from "@/components/dashboard/accounts/profile-form";
import { Loading } from "@/components/loading";

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Account" },
];

export default function AccountsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/protected/profile")
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) toast.error(json.message);
        setUser(json.data);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ContentLayout title="Account">
      <DashboardBreadcrumb items={breadcrumbItems} />

      <div className="container max-w-3xl mx-auto ">
        {loading ? (
          <Loading fullScreen />
        ) : !user ? (
          <p className="mt-6 text-red-500">Unable to load profile.</p>
        ) : (
          <ProfileForm user={user} />
        )}
      </div>
    </ContentLayout>
  );
}
