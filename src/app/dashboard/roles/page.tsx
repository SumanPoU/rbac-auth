"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/dashboard/content-layout";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { DynamicTable } from "@/components/dynamic-table";

import RoleEditForm from "@/components/dashboard/roles/roles-edit-form";
import DeleteDialog from "@/components/dashboard/delete-dialog";
import RoleViewDialog from "@/components/dashboard/roles/role-view-dialog";
import AssignPermissionsDialog from "@/components/dashboard/roles/assign-role-to-permission";
import AssignPagesDialog from "@/components/dashboard/roles/assign-role-to-pages";
import ProtectedPage from "@/components/protected-page";
import { useHasPermission } from "@/hooks/useHasPermission";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  Eye,
  UserCog,
  Bookmark,
} from "lucide-react";

const roleColumns = [
  { accessorKey: "id", header: "Id" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "description", header: "Description" },
  { accessorKey: "isDefault", header: "Default" },
  { accessorKey: "createdAt", header: "Created" },
  { accessorKey: "updatedAt", header: "Updated" },
];

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Roles" },
];

export default function RolesPage() {
  const [editData, setEditData] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [viewId, setViewId] = useState<any>(null);
  const [assignPermissionRoleId, setAssignPermissionRoleId] =
    useState<any>(null);
  const [assignPageRoleId, setAssignPageRoleId] = useState<any>(null);
  const [refresh, setRefresh] = useState(0);

  // Permissions
  const canViewList = useHasPermission("read:roles");
  const canViewDetails = useHasPermission("read:roles-details");
  const canAdd = useHasPermission("add:roles");
  const canEdit = useHasPermission("update:roles");
  const canDelete = useHasPermission("delete:roles");
  const canAssignPages = useHasPermission("update:roles-pages");
  const canAssignPermissions = useHasPermission("update:roles-permissions");

  const hasAnyActions =
    canViewDetails ||
    canEdit ||
    canDelete ||
    canAssignPages ||
    canAssignPermissions;

  return (
    <ProtectedPage permission="read:roles" pageSlug="/dashboard/roles">
      <ContentLayout title="Roles">
        <DashboardBreadcrumb items={breadcrumbItems} />

        {/* Modals */}
        {editData && (
          <RoleEditForm
            open={!!editData}
            data={editData}
            onClose={() => setEditData(null)}
            onUpdated={() => setRefresh((r) => r + 1)}
          />
        )}

        {deleteItem && (
          <DeleteDialog
            open={!!deleteItem}
            setOpen={() => setDeleteItem(null)}
            apiRoute={`/api/protected/roles/${deleteItem.id}`}
            onSuccess={() => {
              setDeleteItem(null);
              setRefresh((r) => r + 1);
            }}
          />
        )}

        {viewId && (
          <RoleViewDialog
            open={!!viewId}
            roleId={viewId}
            onClose={() => setViewId(null)}
          />
        )}

        {assignPermissionRoleId && (
          <AssignPermissionsDialog
            open={!!assignPermissionRoleId}
            roleId={assignPermissionRoleId}
            onClose={() => setAssignPermissionRoleId(null)}
            onUpdated={() => setRefresh((r) => r + 1)}
          />
        )}

        {assignPageRoleId && (
          <AssignPagesDialog
            open={!!assignPageRoleId}
            roleId={assignPageRoleId}
            onClose={() => setAssignPageRoleId(null)}
            onUpdated={() => setRefresh((r) => r + 1)}
          />
        )}

        {/* Table */}
        <DynamicTable
          key={refresh}
          endpoint="/api/protected/roles"
          columns={roleColumns}
          ActionComponent={(item) => {
            if (!hasAnyActions) return null;

            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  {canViewDetails && (
                    <DropdownMenuItem onClick={() => setViewId(item.id)}>
                      <Eye className="w-4 h-4 mr-2" /> View Details
                    </DropdownMenuItem>
                  )}

                  {canAssignPermissions && (
                    <DropdownMenuItem
                      onClick={() => setAssignPermissionRoleId(item.id)}
                    >
                      <UserCog className="w-4 h-4 mr-2" /> Assign Permissions
                    </DropdownMenuItem>
                  )}

                  {canAssignPages && (
                    <DropdownMenuItem
                      onClick={() => setAssignPageRoleId(item.id)}
                      className="text-green-600"
                    >
                      <Bookmark className="w-4 h-4 mr-2" /> Assign Pages
                    </DropdownMenuItem>
                  )}

                  {canEdit && (
                    <DropdownMenuItem onClick={() => setEditData(item)}>
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                  )}

                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => setDeleteItem(item)}
                      className="text-red-600"
                    >
                      <Trash className="w-4 h-4 mr-2" /> Delete
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
