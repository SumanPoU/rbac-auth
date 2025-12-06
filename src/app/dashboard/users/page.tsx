"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

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
  Trash,
  UserCog,
} from "lucide-react";

import UserEditForm from "@/components/dashboard/users/user-edit-form";
import UserSoftDeleteForm from "@/components/dashboard/users/user-soft-delete-form";
import UserDisableForm from "@/components/dashboard/users/user-disable-form";
import UserDetailsDialog from "@/components/dashboard/users/user-detail-dialog";
import DeleteDialog from "@/components/dashboard/delete-dialog";
import UserRoleAssignDialog from "@/components/dashboard/users/user-role-assign";
import { useHasPermission } from "@/hooks/useHasPermission";
import ProtectedPage from "@/components/protected-page";

export default function UsersPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Users" },
  ];

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
  const [viewData, setViewData] = useState<any>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState<any>(null);
  const [refresh, setRefresh] = useState(0);

  // Permissions
  const canView = useHasPermission("read:users-details");
  const canEdit = useHasPermission("update:users");
  const canDisable = useHasPermission("disable:users");
  const canSoftDelete = useHasPermission("soft-delete:users");
  const canHardDelete = useHasPermission("hard-delete:users");
  const canEditRole = useHasPermission("update:users-role");

  const hasAnyActions =
    canView ||
    canEdit ||
    canDisable ||
    canSoftDelete ||
    canHardDelete ||
    canEditRole;

  return (
    <ProtectedPage permission="read:users" pageSlug="/dashboard/users">
      <ContentLayout title="Users">
        <DashboardBreadcrumb items={breadcrumbItems} />

        {/* View User */}
        {viewData && (
          <UserDetailsDialog
            userId={viewData.id}
            open={!!viewData}
            onClose={() => setViewData(null)}
          />
        )}

        {/* Edit User */}
        {editData && (
          <UserEditForm
            open={!!editData}
            data={editData}
            onClose={() => setEditData(null)}
            onUpdated={() => setRefresh((r) => r + 1)}
          />
        )}

        {/* Disable User */}
        {disableItem && (
          <UserDisableForm
            open={!!disableItem}
            data={disableItem}
            onClose={() => setDisableItem(null)}
            onUpdated={() => setRefresh((r) => r + 1)}
          />
        )}

        {/* Soft Delete */}
        {softDeleteItem && (
          <UserSoftDeleteForm
            open={!!softDeleteItem}
            data={softDeleteItem}
            onClose={() => setSoftDeleteItem(null)}
            onUpdated={() => setRefresh((r) => r + 1)}
          />
        )}

        {/* Hard Delete */}
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

        {/* Role Assign */}
        {roleDialogOpen && (
          <UserRoleAssignDialog
            open={!!roleDialogOpen}
            data={roleDialogOpen}
            onClose={() => setRoleDialogOpen(null)}
            onUpdated={() => setRefresh((r) => r + 1)}
          />
        )}

        {/* Table */}
        <DynamicTable
          key={refresh}
          endpoint="/api/protected/users"
          columns={usersColumns}
          ActionComponent={(item) => {
            // If no permissions → hide action button completely
            if (!hasAnyActions) return null;

            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  {canView && (
                    <DropdownMenuItem onClick={() => setViewData(item)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )}

                  {canEditRole && (
                    <DropdownMenuItem onClick={() => setRoleDialogOpen(item)}>
                      <UserCog className="w-4 h-4 mr-2" />
                      Edit User Role
                    </DropdownMenuItem>
                  )}

                  {canEdit && (
                    <DropdownMenuItem onClick={() => setEditData(item)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit User
                    </DropdownMenuItem>
                  )}

                  {canDisable && (
                    <DropdownMenuItem onClick={() => setDisableItem(item)}>
                      <Ban className="w-4 h-4 mr-2" />
                      Disable User
                    </DropdownMenuItem>
                  )}

                  {canSoftDelete && (
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setSoftDeleteItem(item)}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Soft Delete
                    </DropdownMenuItem>
                  )}

                  {canHardDelete && (
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setDeleteItem(item)}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Hard Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }}
        />
      </ContentLayout>
    </ProtectedPage>
  );
}
