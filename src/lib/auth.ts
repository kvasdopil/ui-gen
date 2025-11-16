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
 * Get workspace by ID for the authenticated user
 * Verifies that the workspace belongs to the user
 */
export async function getWorkspaceById(email: string, workspaceId: string) {
  const userId = hashEmail(email);

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      userId,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  return workspace;
}
