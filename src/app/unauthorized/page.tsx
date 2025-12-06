"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md p-6 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-2">
          Unauthorized
        </h1>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Go Back
          </Button>
          <Button onClick={() => router.push("/")} className="flex-1">
            Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
