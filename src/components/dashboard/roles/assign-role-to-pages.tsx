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

interface AssignPagesDialogProps {
  open: boolean;
  roleId: number | null;
  onClose: () => void;
  onUpdated?: () => void;
}

interface Page {
  id: number;
  title: string;
  slug: string;
  staticText?: string;
}

export default function AssignPagesDialog({
  open,
  roleId,
  onClose,
  onUpdated,
}: AssignPagesDialogProps) {
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      pageIds: [] as string[], // MultiSelect expects strings
    },
  });

  // Fetch all pages
  useEffect(() => {
    if (!open) return;

    fetch("/api/protected/pages?type=all")
      .then((res) => res.json())
      .then((data) => setAllPages(data.data))
      .catch(() => toast.error("Failed to fetch pages"));
  }, [open]);

  // Fetch role's assigned pages
  useEffect(() => {
    if (!open || !roleId) return;

    setLoading(true);
    fetch(`/api/protected/roles/${roleId}`)
      .then((res) => res.json())
      .then((data) => {
        const ids = data.data.pages.map((p: Page) => String(p.id));
        form.reset({ pageIds: ids });
      })
      .catch(() => toast.error("Failed to fetch role pages"))
      .finally(() => setLoading(false));
  }, [open, roleId, form]);

  const handleSubmit = async () => {
    try {
      if (!roleId) return;

      const pageIds = form.getValues("pageIds").map(Number);

      const res = await fetch(`/api/protected/roles/${roleId}/pages-to-role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageIds }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update pages");

      toast.success("Pages updated successfully");
      onUpdated?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const multiSelectOptions = allPages.map((p) => ({
    label: `${p.title} — (${p.slug})`,
    value: String(p.id),
  }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle>Assign Pages to Role</DialogTitle>
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
              <label className="block font-medium mb-1">Pages</label>
              <MultiSelect
                options={multiSelectOptions}
                value={form.watch("pageIds")}
                onValueChange={(vals) => form.setValue("pageIds", vals)}
                placeholder="Select pages..."
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
