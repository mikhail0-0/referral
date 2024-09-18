import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Config } from "../config/config";
import { StatusCodes } from "http-status-codes";

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "unauthorized request" });
    return;
  }

  try {
    const payload = jwt.verify(token, Config.secretKey);
    (req as Request & { student?: unknown }).student = payload;
    next();
  } catch {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "invalid token" });
    return;
  }
}
