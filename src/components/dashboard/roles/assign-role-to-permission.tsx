"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { MultiSelect } from "@/components/ui/multi-select";
import { useForm } from "react-hook-form";

interface AssignPermissionsDialogProps {
  open: boolean;
  roleId: number | null;
  onClose: () => void;
  onUpdated?: () => void;
}

interface Permission {
  id: number;
  name: string;
  description: string;
}

export default function AssignPermissionsDialog({
  open,
  roleId,
  onClose,
  onUpdated,
}: AssignPermissionsDialogProps) {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      permissionIds: [] as string[], // use string for MultiSelect
    },
  });

  // Fetch all permissions
  useEffect(() => {
    if (!open) return;
    fetch("/api/protected/permission?type=all")
      .then((res) => res.json())
      .then((data) => setAllPermissions(data.data))
      .catch(() => toast.error("Failed to fetch permissions"));
  }, [open]);

  // Fetch role existing permissions
  useEffect(() => {
    if (!open || !roleId) return;

    setLoading(true);
    fetch(`/api/protected/roles/${roleId}`)
      .then((res) => res.json())
      .then((data) => {
        // Convert permission IDs to strings for MultiSelect
        const ids = data.data.permissions.map((p: Permission) => String(p.id));
        form.reset({ permissionIds: ids });
      })
      .catch(() => toast.error("Failed to fetch role permissions"))
      .finally(() => setLoading(false));
  }, [open, roleId, form]);

  const handleSubmit = async () => {
    try {
      // Convert back to numbers for backend
      const permissionIds = form.getValues("permissionIds").map(Number);
      if (!roleId) return;

      const res = await fetch(
        `/api/protected/roles/${roleId}/permission-to-role`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissionIds }),
        }
      );

      const json = await res.json();
      if (!res.ok)
        throw new Error(json.message || "Failed to assign permissions");

      toast.success("Permissions updated successfully");
      onUpdated?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const multiSelectOptions = allPermissions.map((p) => ({
    label: `${p.name} - ${p.description}`,
    value: String(p.id),
  }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle>Assign Permissions</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="permissions" className="block font-medium mb-1">
                Permissions
              </label>
              <MultiSelect
                options={multiSelectOptions}
                value={form.watch("permissionIds")}
                onValueChange={(vals) => form.setValue("permissionIds", vals)}
                placeholder="Select permissions..."
              />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
