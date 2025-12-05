"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

export default function PermissionEditForm({ open, onClose, data, onUpdated }: any) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: data?.name || "",
    description: data?.description || "",
  });

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/protected/permission/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Failed to update permission");

      toast.success("Permission updated successfully");

      onUpdated?.(); // reload table
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
          <DialogTitle>Edit Permission</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Permission name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe this permission"
            />
          </div>

          <Button onClick={handleUpdate} disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Permission"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
