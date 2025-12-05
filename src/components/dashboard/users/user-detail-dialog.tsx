"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface Permission {
  id: number;
  name: string;
  description?: string;
}

interface Page {
  id: number;
  title: string;
  slug: string;
  staticText?: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  isDefault: boolean;
  permissions: Permission[];
  pages: Page[];
}

interface User {
  id: number;
  name: string;
  username?: string | null;
  email: string;
  image?: string | null;
  isDisabled: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  role: Role;
}

interface UserDetailsDialogProps {
  userId: number;
  open: boolean;
  onClose: () => void;
}

export default function UserDetailsDialog({
  userId,
  open,
  onClose,
}: UserDetailsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/protected/users/${userId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch user");
        }

        setUser(data.data);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : !user ? (
          <p className="text-center text-red-500">User not found.</p>
        ) : (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              {user.image && (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-16 w-16 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                {user.username && (
                  <p className="text-sm text-gray-500">
                    Username: {user.username}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  {user.isDeleted
                    ? "Soft Deleted"
                    : user.isDisabled
                    ? "Disabled"
                    : "Active"}
                </p>
              </div>
            </div>

            {/* Role Info */}
            <div>
              <h4 className="font-semibold">Role</h4>
              <p>
                {user.role.name} {user.role.isDefault && "(Default)"}
              </p>
              {user.role.description && (
                <p className="text-sm text-gray-500">{user.role.description}</p>
              )}
            </div>

            {/* Permissions Table */}
            <div>
              <h4 className="font-semibold mb-2">Permissions</h4>
              {user.role.permissions.length > 0 ? (
                <table className="w-full border-collapse border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">Name</th>
                      <th className="border p-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.role.permissions.map((perm) => (
                      <tr key={perm.id} className="hover:bg-gray-50">
                        <td className="border p-2">{perm.name}</td>
                        <td className="border p-2">
                          {perm.description || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">
                  No permissions assigned.
                </p>
              )}
            </div>

            {/* Pages Table */}
            <div>
              <h4 className="font-semibold mb-2">Accessible Pages</h4>
              {user.role.pages.length > 0 ? (
                <table className="w-full border-collapse border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">Title</th>
                      <th className="border p-2 text-left">Slug</th>
                      <th className="border p-2 text-left">Static Text</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.role.pages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50">
                        <td className="border p-2">{page.title}</td>
                        <td className="border p-2">{page.slug}</td>
                        <td className="border p-2">{page.staticText || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">No pages assigned.</p>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
