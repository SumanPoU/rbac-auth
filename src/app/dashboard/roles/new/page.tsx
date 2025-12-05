"use client";

import { useState } from "react";

import { ContentLayout } from "@/components/dashboard/content-layout";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { AddRoleForm } from "@/components/dashboard/roles/roles-add-form";

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Role", href: "/dashboard/roles" },
  { label: "New" },
];

export default function RolePage() {
  return (
    <ContentLayout title="Add Role">
      <DashboardBreadcrumb items={breadcrumbItems} />
      <div className="container max-w-xl mx-auto my-4 justify-center  items-center">
        <AddRoleForm />
      </div>
    </ContentLayout>
  );
}
