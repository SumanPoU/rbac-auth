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
import { MoreHorizontal, Pencil, Trash, Eye } from "lucide-react";

import PagesEditForm from "@/components/dashboard/pages/pages-edit-form";
import DeleteDialog from "@/components/dashboard/delete-dialog";
// import PageDetailsDialog from "@/components/dashboard/pages/page-details-dialog";
import ProtectedPage from "@/components/protected-page";
import { useHasPermission } from "@/hooks/useHasPermission";

export default function PagesPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pages" },
  ];

  const pagesColumns = [
    { accessorKey: "id", header: "Id" },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "slug", header: "Slug" },
    { accessorKey: "staticText", header: "Static Text" },
    { accessorKey: "createdAt", header: "Created" },
    { accessorKey: "updatedAt", header: "Updated" },
  ];

  const [editData, setEditData] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [refresh, setRefresh] = useState(0);

  // Permissions
  const canViewPageList = useHasPermission("read:pages");
  const canViewPageDetails = useHasPermission("read:pages-details");
  const canAddPage = useHasPermission("add:pages");
  const canEditPage = useHasPermission("update:pages");
  const canDeletePage = useHasPermission("delete:pages");

  const hasAnyActions = canViewPageDetails || canEditPage || canDeletePage;

  return (
    <ProtectedPage permission="read:pages" pageSlug="/dashboard/pages">
      <ContentLayout title="Pages">
        <DashboardBreadcrumb items={breadcrumbItems} />

        {/* View Page */}
        {/* {viewData && (
          <PageDetailsDialog
            pageId={viewData.id}
            open={!!viewData}
            onClose={() => setViewData(null)}
          />
        )} */}

        {/* Edit Page */}
        {editData && (
          <PagesEditForm
            open={!!editData}
            data={editData}
            onClose={() => setEditData(null)}
            onUpdated={() => setRefresh((r) => r + 1)}
          />
        )}

        {/* Delete Page */}
        {deleteItem && (
          <DeleteDialog
            open={!!deleteItem}
            setOpen={() => setDeleteItem(null)}
            apiRoute={`/api/protected/pages/${deleteItem.id}`}
            onSuccess={() => {
              setDeleteItem(null);
              setRefresh((r) => r + 1);
            }}
          />
        )}

        {/* Table */}
        <DynamicTable
          key={refresh}
          endpoint="/api/protected/pages"
          columns={pagesColumns}
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
                  {/* {canViewPageDetails && (
                    <DropdownMenuItem onClick={() => setViewData(item)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )} */}

                  {canEditPage && (
                    <DropdownMenuItem onClick={() => setEditData(item)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}

                  {canDeletePage && (
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
