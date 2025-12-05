"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface UserSoftDeleteFormProps {
  open: boolean;
  onClose: () => void;
  data: any;
  onUpdated?: () => void;
}

export default function UserSoftDeleteForm({
  open,
  onClose,
  data,
  onUpdated,
}: UserSoftDeleteFormProps) {
  const [loading, setLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  console.log("Soft Delete Data:", data);

  useEffect(() => {
    if (data) {
      setIsDeleted(data.isDeleted || false);
    }
  }, [data]);

  const handleSoftDelete = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/protected/users/soft-delete/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: !isDeleted }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update user");

      toast.success(json.message);
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
          <DialogTitle>
            {isDeleted ? "Restore User" : "Soft Delete User"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p>
            Are you sure you want to {isDeleted ? "restore" : "soft-delete"}{" "}
            user <strong>{data?.name}</strong>?
          </p>

          <Button
            onClick={handleSoftDelete}
            disabled={loading}
            className="w-fit"
            variant={isDeleted ? "secondary" : "destructive"}
          >
            {loading
              ? isDeleted
                ? "Restoring..."
                : "Deleting..."
              : isDeleted
              ? "Restore User"
              : "Soft Delete User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
