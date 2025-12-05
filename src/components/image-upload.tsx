"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export default function ImageUploader({
  value,
  onChange,
  className,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    setUploading(false);

    if (data.secure_url) {
      onChange(data.secure_url);
      toast.success("Image uploaded successfully!");
    } else {
      toast.error("Image upload failed");
    }
  };

  return (
    <div>
      {value ? (
        <div className={`relative ${className ?? ""}`}>
          <Image
            src={value}
            alt="Uploaded Image"
            fill
            className="rounded-md object-cover border"
          />

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-white shadow rounded-full p-1 hover:bg-red-500 hover:text-white transition"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer flex items-center justify-center p-3 border rounded-md hover:bg-gray-50 text-sm w-32">
          {uploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelect}
          />
        </label>
      )}
    </div>
  );
}
