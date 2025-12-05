"use client";

import { useState } from "react";

import { ContentLayout } from "@/components/dashboard/content-layout";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { AddUserForm } from "@/components/dashboard/users/user-add-form";

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Users", href: "/dashboard/users" },
  { label: "New" },
];

export default function UsersPage() {
  return (
    <ContentLayout title="Add Users">
      <DashboardBreadcrumb items={breadcrumbItems} />
      <div className="container max-w-2xl mx-auto my-4 justify-center  items-center">
        <AddUserForm />
      </div>
    </ContentLayout>
  );
}
