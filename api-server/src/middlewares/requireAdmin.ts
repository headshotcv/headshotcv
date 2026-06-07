import { getAuth, clerkClient } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export interface AdminRequest extends Request {
  userId?: string;
}

// Owner allowlist. Comma-separated emails in ADMIN_EMAILS. Compared
// case-insensitively against the signed-in user's VERIFIED Clerk emails only.
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// Resolve whether a Clerk user is an allowlisted owner. Only verified email
// addresses are considered, so an attacker cannot gain access by attaching an
// unverified email that happens to match the allowlist.
export async function isAdminUser(userId: string): Promise<boolean> {
  const allow = adminEmails();
  if (allow.length === 0) {
    logger.warn("isAdminUser: ADMIN_EMAILS is empty, denying all access");
    return false;
  }
  const user = await clerkClient.users.getUser(userId);
  const verifiedEmails = user.emailAddresses
    .filter((e) => e.verification?.status === "verified")
    .map((e) => e.emailAddress.toLowerCase());
  return verifiedEmails.some((e) => allow.includes(e));
}

// Gate a route to the site owner(s) only. Resolves the caller's identity from
// Clerk server-side (never trusting client input) and checks the allowlist.
export async function requireAdmin(
  req: AdminRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    if (!(await isAdminUser(userId))) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    req.userId = userId;
    next();
  } catch (err) {
    logger.error({ err, userId }, "requireAdmin: failed to resolve Clerk user");
    res.status(403).json({ error: "Forbidden" });
  }
}
