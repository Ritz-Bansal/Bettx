import { Request, Response, NextFunction } from "express";
import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";

configDotenv();

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const headers: string[] | " " = req.headers.authorization?.split(" ") || " ";
  
  const token: string = headers[1];
  const JWT_SECRET: string = process.env.JWT_SECRET || " ";
  try {
    const id: string | jwt.JwtPayload = jwt.verify(token, JWT_SECRET);
    req.id = id;
    next();
  } catch (error) {
  
  }
}
