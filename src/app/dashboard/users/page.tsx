import { UsersTable } from "@/components/dashboard/users/users-table";
import { ContentLayout } from "@/components/dashboard/content-layout";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";

export default function AccountPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Users" }, 
  ];
  return (
    <ContentLayout title="Users">
      <DashboardBreadcrumb items={breadcrumbItems} />
      <UsersTable />
    </ContentLayout>
  );
}
