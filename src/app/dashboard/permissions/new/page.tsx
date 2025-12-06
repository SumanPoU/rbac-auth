"use client";

import { useState } from "react";

import { ContentLayout } from "@/components/dashboard/content-layout";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { AddPermissionForm } from "@/components/dashboard/permissions/permission-add-form";
import ProtectedPage from "@/components/protected-page";

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Permissions", href: "/dashboard/permissions" },
  { label: "New" },
];

export default function PermissionsPage() {
  return (
    <ProtectedPage
      permission="add:permissions"
      pageSlug="/dashboard/permissions/new"
    >
      <ContentLayout title="Add Permissions">
        <DashboardBreadcrumb items={breadcrumbItems} />
        <div className="container max-w-xl mx-auto my-4 justify-center  items-center">
          <AddPermissionForm />
        </div>
      </ContentLayout>
    </ProtectedPage>
  );
}
