"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { FaUserCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserAvatar() {
  const { data: session, status } = useSession();

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event propagation to parent
    if (status === "loading") return;

    if (!session) {
      // Not authenticated - initiate sign in
      signIn("google");
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event propagation to parent
    signOut();
  };

  const isLoading = status === "loading";

  return (
    <div
      className="fixed top-4 right-4 z-[9999]"
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {!session ? (
        <Button
          onClick={handleAvatarClick}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          disabled={isLoading}
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full"
          aria-label="Sign in"
        >
          <FaUserCircle className="h-10 w-10 text-muted-foreground" />
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              aria-label="User menu"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseMove={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-10 w-10 border-2 border-background shadow-lg">
                {session.user?.image ? (
                  <AvatarImage src={session.user.image} alt={session.user.name || "User avatar"} />
                ) : (
                  <AvatarFallback>
                    <FaUserCircle className="h-6 w-6" />
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64"
            onMouseDown={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                {session.user?.name && (
                  <p className="text-sm font-semibold">{session.user.name}</p>
                )}
                {session.user?.email && (
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
