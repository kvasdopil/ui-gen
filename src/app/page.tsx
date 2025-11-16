"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import UserAvatar from "@/components/UserAvatar";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    // Only redirect to files page if user is authenticated
    if (session) {
      router.push("/files");
    }
  }, [router, status, session]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show sign-in page if not authenticated
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-neutral-900">
      <UserAvatar />
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">UI Generator</h1>
        <p className="text-gray-500 dark:text-gray-400">Sign in to get started</p>
      </div>
    </div>
  );
}
