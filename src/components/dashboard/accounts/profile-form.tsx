"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import ImageUploader from "@/components/image-upload";
import { PasswordInput } from "@/components/ui/password-input";

interface ProfileFormProps {
  user: any;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user.name || "",
    username: user.username || "",
    image: user.image || "",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/protected/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      // ALWAYS show backend response
      if (json.success) {
        toast.success(json.message || "Profile updated successfully");
      } else {
        toast.error(json.message || "Update failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 max-w-2xl space-y-5 bg-white p-6 rounded-lg shadow"
    >
      <h2 className="text-lg font-semibold">Your Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NAME */}
        <div>
          <label className="block font-medium mb-1">Name</label>
          <Input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        {/* USERNAME */}
        <div>
          <label className="block font-medium mb-1">Username</label>
          <Input
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
          />
        </div>

        {/* EMAIL (READ ONLY) */}
        <div>
          <label className="block font-medium mb-1">Email</label>
          <Input value={user.email} disabled className="bg-gray-100" />
        </div>

        {/* PASSWORD */}
        {user.isCredentials && (
          <div>
            <label className="block font-medium mb-1">
              New Password (optional)
            </label>
            <PasswordInput
              id="password"
              name="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Enter a strong password"
              disabled={saving}
            />
          </div>
        )}

        {/* IMAGE URL */}
        <div>
          <label className="text-sm font-medium mb-1">Profile Image</label>
          <ImageUploader
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
            className="w-32 h-32"
          />
        </div>
      </div>

      {/* ROLE DETAILS */}
      <div className="border-t pt-4">
        <p className="text-sm">
          <strong>Role:</strong> {user.role?.name}
        </p>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
