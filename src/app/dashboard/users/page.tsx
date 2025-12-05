"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/dashboard/content-layout";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { DynamicTable } from "@/components/dynamic-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Archive,
  Ban,
  Eye,
  MoreHorizontal,
  Pencil,
  PenIcon,
  Trash,
  User,
  UserCog,
} from "lucide-react";

import UserEditForm from "@/components/dashboard/users/user-edit-form";
import UserSoftDeleteForm from "@/components/dashboard/users/user-soft-delete-form";
import UserDisableForm from "@/components/dashboard/users/user-disable-form";
import UserDetailsDialog from "@/components/dashboard/users/user-detail-dialog";
import DeleteDialog from "@/components/dashboard/delete-dialog";
import UserRoleAssignDialog from "@/components/dashboard/users/user-role-assign";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Users" },
  ];

  // Columns for users table
  const usersColumns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    {
      accessorFn: (row: any) => row.username || "_",
      id: "username",
      header: "Username",
    },
    { accessorKey: "email", header: "Email" },
    {
      accessorFn: (row: any) => row.role?.name || "-",
      id: "role",
      header: "Role",
    },
    {
      accessorFn: (row: any) => (row.isDisabled ? "Yes" : "No"),
      id: "isDisabled",
      header: "Disabled",
    },
    {
      accessorFn: (row: any) => (row.isDeleted ? "Yes" : "No"),
      id: "isDeleted",
      header: "Deleted",
    },
    { accessorKey: "createdAt", header: "Created At" },
    { accessorKey: "updatedAt", header: "Updated At" },
  ];

  const [editData, setEditData] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [disableItem, setDisableItem] = useState<any>(null);
  const [softDeleteItem, setSoftDeleteItem] = useState<any>(null);
  const [viewData, setviewData] = useState<any>(null);
  const [refresh, setRefresh] = useState(0);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <ContentLayout title="Users">
      <DashboardBreadcrumb items={breadcrumbItems} />
      {/* View User Details Dialog */}{" "}
      {viewData && (
        <UserDetailsDialog
          userId={viewData.id}
          open={!!viewData}
          onClose={() => setviewData(null)}
        />
      )}
      {/* Edit Role Form */}
      {editData && (
        <UserEditForm
          open={!!editData}
          data={editData}
          onClose={() => setEditData(null)}
          onUpdated={() => setRefresh((r) => r + 1)}
        />
      )}
      {disableItem && (
        <UserDisableForm
          open={!!disableItem}
          data={disableItem}
          onClose={() => setDisableItem(null)}
          onUpdated={() => setRefresh((r) => r + 1)}
        />
      )}
      {/* Soft Delete Modal */}
      {softDeleteItem && (
        <UserSoftDeleteForm
          open={!!softDeleteItem}
          data={softDeleteItem}
          onClose={() => setSoftDeleteItem(null)}
          onUpdated={() => setRefresh((r) => r + 1)}
        />
      )}
      {/* Delete Modal */}
      {deleteItem && (
        <DeleteDialog
          open={!!deleteItem}
          setOpen={() => setDeleteItem(null)}
          apiRoute={`/api/protected/users/${deleteItem.id}`}
          onSuccess={() => {
            setDeleteItem(null);
            setRefresh((r) => r + 1);
          }}
        />
      )}
      {/* Assign Role Modal */}
      {roleDialogOpen && (
        <UserRoleAssignDialog
          open={roleDialogOpen}
          onClose={() => setRoleDialogOpen(false)}
          data={roleDialogOpen}
          onUpdated={() => setRefresh((r) => r + 1)}
        />
      )}
      {/* Users Table */}
      <DynamicTable
        key={refresh}
        endpoint="/api/protected/users"
        columns={usersColumns}
        ActionComponent={(item) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setviewData(item)}>
                <Eye className="w-4 h-4 mr-2" /> View User Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleDialogOpen(item)}>
                <UserCog className="w-4 h-4 mr-2" /> Edit User Role
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setEditData(item)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setDisableItem(item)}>
                <Ban className="w-4 h-4 mr-2" /> Disabel
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setSoftDeleteItem(item)}
                className="text-red-600"
              >
                <Archive className="w-4 h-4 mr-2" /> Soft Delete
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setDeleteItem(item)}
                className="text-red-600"
              >
                <Trash className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
    </ContentLayout>
  );
}
