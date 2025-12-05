"use client";

import { SessionProvider } from "next-auth/react";
import CookieConsent from "@/components/cookie-consent";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <CookieConsent
        variant="default"
        onAcceptCallback={() => console.log("Accepted")}
        onDeclineCallback={() => console.log("Declined")}
      />
      {children}
    </SessionProvider>
  );
}
