"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, Users, Lock, LogOut, Github } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className=" border-b ">
        <div className="container max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-semibold text-lg">Demo Auth</div>

          {!session ? (
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src={session.user?.image || ""} alt="User" />
                  <AvatarFallback>
                    {getInitials(session.user?.name || "")}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
                <p className="px-3 pb-1 text-xs text-muted-foreground">
                  {session.user?.email}
                </p>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 px-6 py-16 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Simple RBAC System</h1>
        <p className="text-muted-foreground">
          Minimal role & permission based authentication demo.
        </p>

        <a
          href="https://github.com/SumanPoU/rbac-auth.git"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="mt-6 gap-2">
            <Github className="w-4 h-4" />
            View on GitHub
          </Button>
        </a>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center space-y-2">
            <Shield className="w-6 h-6 mx-auto" />
            <h3 className="font-medium">Secure Auth</h3>
            <p className="text-sm text-muted-foreground">NextAuth.js</p>
          </Card>

          <Card className="p-4 text-center space-y-2">
            <Users className="w-6 h-6 mx-auto" />
            <h3 className="font-medium">Role Management</h3>
            <p className="text-sm text-muted-foreground">Custom roles</p>
          </Card>

          <Card className="p-4 text-center space-y-2">
            <Lock className="w-6 h-6 mx-auto" />
            <h3 className="font-medium">Permissions</h3>
            <p className="text-sm text-muted-foreground">Page access control</p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        Built with Next.js, NextAuth, Prisma & shadcn/ui
      </footer>
    </div>
  );
}
