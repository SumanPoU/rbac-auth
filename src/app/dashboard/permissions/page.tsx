// import { DynamicTable } from "@/components/dynamic-table";
// import { ContentLayout } from "@/components/dashboard/content-layout";
// import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";

// const permissionColumns = [
//   { accessorKey: "id", header: "Id" },
//   { accessorKey: "name", header: "Name" },
//   { accessorKey: "description", header: "Description" },
//   { accessorKey: "createdAt", header: "Created" },
//   { accessorKey: "updatedAt", header: "Updated" },
// ];

// const breadcrumbItems = [
//   { label: "Home", href: "/" },
//   { label: "Dashboard", href: "/dashboard" },
//   { label: "Permissions" },
// ];
// export default function PermissionsPage() {
//   return (
//     <ContentLayout title="Permissions">
//       <DashboardBreadcrumb items={breadcrumbItems} />
//       <DynamicTable
//         endpoint="/api/protected/permission"
//         columns={permissionColumns}
//       />
//     </ContentLayout>
//   );
// }

"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/dashboard/content-layout";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { DynamicTable } from "@/components/dynamic-table";

import PermissionEditForm from "@/components/dashboard/permissions/permission-edit-form";
import DeleteDialog from "@/components/dashboard/delete-dialog";
// import PermissionDetailsDialog from "@/components/dashboard/permissions/permission-details-dialog";
import ProtectedPage from "@/components/protected-page";
import { useHasPermission } from "@/hooks/useHasPermission";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash, Eye } from "lucide-react";

const permissionColumns = [
  { accessorKey: "id", header: "Id" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "description", header: "Description" },
  { accessorKey: "createdAt", header: "Created" },
  { accessorKey: "updatedAt", header: "Updated" },
];

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Permissions" },
];

export default function PermissionsPage() {
  const [editData, setEditData] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [refresh, setRefresh] = useState(0);

  // Permissions
  const canViewList = useHasPermission("read:permissions");
  const canViewDetails = useHasPermission("read:permissions-details");
  const canAdd = useHasPermission("add:permissions");
  const canEdit = useHasPermission("update:permissions");
  const canDelete = useHasPermission("delete:permissions");

  const hasAnyActions = canViewDetails || canEdit || canDelete;

  return (
    <ProtectedPage
      permission="read:permissions"
      pageSlug="/dashboard/permissions"
    >
      <ContentLayout title="Permissions">
        <DashboardBreadcrumb items={breadcrumbItems} />

        {/* View Permission */}
        {/* {viewData && (
          <PermissionDetailsDialog
            permissionId={viewData.id}
            open={!!viewData}
            onClose={() => setViewData(null)}
          />
        )} */}

        {/* Edit Permission */}
        {editData && (
          <PermissionEditForm
            open={!!editData}
            data={editData}
            onClose={() => setEditData(null)}
            onUpdated={() => setRefresh((r) => r + 1)}
          />
        )}

        {/* Delete Permission */}
        {deleteItem && (
          <DeleteDialog
            open={!!deleteItem}
            setOpen={() => setDeleteItem(null)}
            apiRoute={`/api/protected/permission/${deleteItem.id}`}
            onSuccess={() => {
              setDeleteItem(null);
              setRefresh((r) => r + 1);
            }}
          />
        )}

        {/* Table */}
        <DynamicTable
          key={refresh}
          endpoint="/api/protected/permission"
          columns={permissionColumns}
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
                  {/* {canViewDetails && (
                    <DropdownMenuItem onClick={() => setViewData(item)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )} */}

                  {canEdit && (
                    <DropdownMenuItem onClick={() => setEditData(item)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}

                  {canDelete && (
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setDeleteItem(item)}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
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
