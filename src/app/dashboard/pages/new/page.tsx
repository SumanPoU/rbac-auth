"use client";

import { useState } from "react";

import { ContentLayout } from "@/components/dashboard/content-layout";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { AddPageForm } from "@/components/dashboard/pages/pages-add-form";
import ProtectedPage from "@/components/protected-page";

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Pages", href: "/dashboard/pages" },
  { label: "New" },
];

export default function PagesPage() {
  return (
    <ProtectedPage permission="add:pages" pageSlug="/dashboard/pages/new">
      <ContentLayout title="Add Pages">
        <DashboardBreadcrumb items={breadcrumbItems} />
        <div className="container max-w-xl mx-auto my-4 justify-center  items-center">
          <AddPageForm />
        </div>
      </ContentLayout>
    </ProtectedPage>
  );
}
