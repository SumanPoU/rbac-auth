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
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

import RoleEditForm from "@/components/dashboard/roles/roles-edit-form";
import DeleteDialog from "@/components/dashboard/delete-dialog";

export default function RolePage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Roles" },
  ];

  const permissionColumns = [
    { accessorKey: "id", header: "Id" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "isDefault", header: "Default" },
    { accessorKey: "createdAt", header: "Created" },
    { accessorKey: "updatedAt", header: "Updated" },
  ];

  const [editData, setEditData] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [refresh, setRefresh] = useState(0);
  return (
    <ContentLayout title="Roles">
      <DashboardBreadcrumb items={breadcrumbItems} />

      {editData && (
        <RoleEditForm
          open={!!editData}
          data={editData}
          onClose={() => setEditData(null)}
          onUpdated={() => setRefresh((r) => r + 1)}
        />
      )}

      {/* ⭐ Delete Modal */}
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

      <DynamicTable
        key={refresh}
        endpoint="/api/protected/roles"
        columns={permissionColumns}
        ActionComponent={(item) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditData(item)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
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
