"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

interface PagesEditFormProps {
  open: boolean;
  onClose: () => void;
  data: {
    id: number;
    title: string;
    slug: string;
    staticText?: string;
  } | null;
  onUpdated?: () => void;
}

export default function PagesEditForm({
  open,
  onClose,
  data,
  onUpdated,
}: PagesEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    staticText: "",
  });

  // Update form when data changes
  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || "",
        slug: data.slug || "",
        staticText: data.staticText || "",
      });
    }
  }, [data]);

  const handleUpdate = async () => {
    if (!data) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/protected/pages/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Failed to update page");

      toast.success("Page updated successfully");

      onUpdated?.(); // reload table
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Page</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Page title"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="Page slug (unique)"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={form.staticText}
              onChange={(e) => setForm({ ...form, staticText: e.target.value })}
              placeholder="Page content"
              rows={6}
            />
          </div>

          <Button onClick={handleUpdate} disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Page"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
