"use client";

import { useState } from "react";

import { ContentLayout } from "@/components/dashboard/content-layout";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { AddUserForm } from "@/components/dashboard/users/user-add-form";
import ProtectedPage from "@/components/protected-page";

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Users", href: "/dashboard/users" },
  { label: "New" },
];

export default function UsersPage() {
  return (
    <ProtectedPage permission="create:users" pageSlug="/dashboard/users/new">
      <ContentLayout title="Add Users">
        <DashboardBreadcrumb items={breadcrumbItems} />
        <div className="container max-w-2xl mx-auto my-4 justify-center  items-center">
          <AddUserForm />
        </div>
      </ContentLayout>
    </ProtectedPage>
  );
}
