import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "./prisma";
import crypto from "crypto";

/**
 * Hash email for use as userId
 * This provides a consistent identifier while keeping emails private
 */
function hashEmail(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}

export async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

/**
 * Get or create workspace for the authenticated user
 * Uses email hash as userId for privacy and consistency
 */
export async function getOrCreateWorkspace(email: string) {
  const userId = hashEmail(email);

  // Get or create user's default workspace
  let workspace = await prisma.workspace.findUnique({
    where: {
      userId_name: {
        userId,
        name: "default",
      },
    },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        userId,
        name: "default",
      },
    });
  }

  return workspace;
}

