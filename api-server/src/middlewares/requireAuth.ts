import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export interface AuthedRequest extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

// Resolve the Clerk user id when present, without rejecting the request.
export function getOptionalUserId(req: Request): string | null {
  const auth = getAuth(req);
  return auth?.userId ?? null;
}
