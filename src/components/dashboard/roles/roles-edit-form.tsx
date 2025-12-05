"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";

export default function RoleEditForm({ open, onClose, data, onUpdated }: any) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: data?.name || "",
    description: data?.description || "",
    isDefault: data?.isDefault || false,
  });

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/protected/roles/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Failed to update role");

      toast.success("Role updated successfully");

      onUpdated?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Role name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe this role"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={form.isDefault}
              onCheckedChange={(checked) =>
                setForm({ ...form, isDefault: !!checked })
              }
            />
            <span className="text-sm">Set as default role</span>
          </div>

          <Button onClick={handleUpdate} disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
