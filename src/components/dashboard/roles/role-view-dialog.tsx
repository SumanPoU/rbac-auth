"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { toast } from "react-hot-toast";

interface RoleDetailsDialogProps {
  open: boolean;
  roleId: number | null;
  onClose: () => void;
}

export default function RoleDetailsDialog({
  open,
  roleId,
  onClose,
}: RoleDetailsDialogProps) {
  const [role, setRole] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roleId) return;

    setLoading(true);
    setError(null);
    setRole(null);

    fetch(`/api/protected/roles/${roleId}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "Failed to fetch role details");
        }
        return json;
      })
      .then((data) => {
        setRole(data.data);
      })
      .catch((err: any) => {
        const message = err.message || "Something went wrong";
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [roleId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Role Details</DialogTitle>
        </DialogHeader>

        {/* LOADING */}
        {loading && <p>Loading...</p>}

        {/* ERROR MESSAGE */}
        {!loading && error && (
          <p className="text-red-600 font-medium border border-red-300 p-3 rounded-md">
            Error: {error}
          </p>
        )}

        {/* SUCCESS CONTENT */}
        {!loading && !error && role && (
          <div className="space-y-6">
            {/* ROLE INFO */}
            <div className="p-4 border rounded-md">
              <h2 className="font-semibold text-lg">{role.name}</h2>
              <p className="text-sm text-muted-foreground">
                {role.description}
              </p>
            </div>

            {/* PERMISSIONS TABLE */}
            <div className="overflow-x-auto">
              <h3 className="font-semibold mb-2">Permissions</h3>
              <Table className="border border-gray-200 border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="border border-gray-200">ID</TableHead>
                    <TableHead className="border border-gray-200">
                      Name
                    </TableHead>
                    <TableHead className="border border-gray-200">
                      Description
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {role.permissions.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="border border-gray-200">
                        {p.id}
                      </TableCell>
                      <TableCell className="border border-gray-200">
                        {p.name}
                      </TableCell>
                      <TableCell className="border border-gray-200">
                        {p.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* PAGES TABLE */}
            <div className="overflow-x-auto">
              <h3 className="font-semibold mb-2">Allowed Pages</h3>
              <Table className="border border-gray-200 border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="border border-gray-200">ID</TableHead>
                    <TableHead className="border border-gray-200">
                      Title
                    </TableHead>
                    <TableHead className="border border-gray-200">
                      Slug
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {role.pages.map((pg: any) => (
                    <TableRow key={pg.id}>
                      <TableCell className="border border-gray-200">
                        {pg.id}
                      </TableCell>
                      <TableCell className="border border-gray-200">
                        {pg.title}
                      </TableCell>
                      <TableCell className="border border-gray-200">
                        {pg.slug}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
