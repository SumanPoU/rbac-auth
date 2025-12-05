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

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface UserRoleAssignProps {
  open: boolean;
  onClose: () => void;
  data: any; // user data
  onUpdated?: () => void;
}

export default function UserRoleAssignDialog({
  open,
  onClose,
  data,
  onUpdated,
}: UserRoleAssignProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Load roles + user role
  useEffect(() => {
    if (!open) return;

    const loadRoles = async () => {
      try {
        const res = await fetch("/api/protected/roles");
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setRoles(json.data);

        // preselect user's current role
        setSelectedRoleId(data?.role?.id || json.data[0]?.id);
      } catch (err: any) {
        toast.error(err.message);
      }
    };

    loadRoles();
  }, [open, data]);

  const handleAssign = async () => {
    if (!selectedRoleId) {
      toast.error("Please select a role");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/protected/users/${data.id}/roles-to-user`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: selectedRoleId }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

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
          <DialogTitle>Assign Role</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p>
            Assign a new role to user <strong>{data?.name}</strong>.
          </p>

          <Select
            value={selectedRoleId?.toString()}
            onValueChange={(v) => setSelectedRoleId(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleAssign} disabled={loading} className="w-fit">
            {loading ? "Assigning..." : "Assign Role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
