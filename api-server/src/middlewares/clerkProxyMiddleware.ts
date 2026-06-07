import { RequestHandler } from "express";

export const CLERK_PROXY_PATH = "/api/__clerk";

export const clerkProxyMiddleware = (): RequestHandler => {
  return (req, res, next) => {
    // Clerk est désactivé ici. On laisse juste passer la requête sans bloquer.
    next();
  };
};