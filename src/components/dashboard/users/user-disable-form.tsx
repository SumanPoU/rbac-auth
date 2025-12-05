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

interface UserDisableFormProps {
  open: boolean;
  onClose: () => void;
  data: any;
  onUpdated?: () => void;
}

export default function UserDisableForm({
  open,
  onClose,
  data,
  onUpdated,
}: UserDisableFormProps) {
  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (data) {
      setIsDisabled(data.isDisabled || false);
    }
  }, [data]);

  const handleDisable = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/protected/users/${data.id}/disable`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDisabled: !isDisabled }),
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
            {isDisabled ? "Enable User" : "Disable User"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p>
            Are you sure you want to {isDisabled ? "enable" : "disable"} user{" "}
            <strong>{data?.name}</strong>?
          </p>

          <Button
            onClick={handleDisable}
            disabled={loading}
            className="w-fit"
            variant={isDisabled ? "secondary" : "destructive"}
          >
            {loading
              ? isDisabled
                ? "Enabling..."
                : "Disabling..."
              : isDisabled
              ? "Enable User"
              : "Disable User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
