// "use client";

// import { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { toast } from "react-hot-toast";

// interface UserEditFormProps {
//   open: boolean;
//   onClose: () => void;
//   data: any;
//   onUpdated?: () => void;
// }

// export default function UserEditForm({
//   open,
//   onClose,
//   data,
//   onUpdated,
// }: UserEditFormProps) {
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState({
//     name: "",
//     username: "",
//     email: "",
//     image: "",
//   });

//   // Populate form when data changes
//   useEffect(() => {
//     if (data) {
//       setForm({
//         name: data.name || "",
//         username: data.username || "",
//         email: data.email || "",
//         image: data.image || "",
//       });
//     }
//   }, [data]);

//   const handleUpdate = async () => {
//     try {
//       setLoading(true);

//       const res = await fetch(`/api/protected/users/${data.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const json = await res.json();

//       if (!res.ok) throw new Error(json.message || "Failed to update user");

//       toast.success("User updated successfully");
//       onUpdated?.();
//       onClose();
//     } catch (err: any) {
//       toast.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>Edit User</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           <div>
//             <label className="text-sm font-medium">Name</label>
//             <Input
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               placeholder="User name"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium">Username</label>
//             <Input
//               value={form.username}
//               onChange={(e) => setForm({ ...form, username: e.target.value })}
//               placeholder="Username"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium">Email</label>
//             <Input
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               placeholder="Email"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium">Image URL</label>
//             <Input
//               value={form.image}
//               onChange={(e) => setForm({ ...form, image: e.target.value })}
//               placeholder="Profile image URL"
//             />
//           </div>

//           <Button onClick={handleUpdate} disabled={loading} className="w-full">
//             {loading ? "Updating..." : "Update User"}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

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
import { toast } from "react-hot-toast";
import ImageUploader from "@/components/image-upload";

interface UserEditFormProps {
  open: boolean;
  onClose: () => void;
  data: any;
  onUpdated?: () => void;
}

export default function UserEditForm({
  open,
  onClose,
  data,
  onUpdated,
}: UserEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    image: "",
  });

  // Populate form with existing user data
  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        username: data.username || "",
        email: data.email || "",
        image: data.image || "",
      });
    }
  }, [data]);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/protected/users/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Failed to update user");

      toast.success("User updated successfully");
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
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="User name"
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-sm font-medium">Username</label>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Username"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium mb-1">Profile Image</label>
            <ImageUploader
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              className="w-24 h-24"
            />
          </div>

          <Button onClick={handleUpdate} disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
