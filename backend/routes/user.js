import express from "express";
import { checkBalance, checkTransfer, odds, testAPI } from "../controllers/user.js";
// import { authMiddleware } from "../middlewares/auth.js";

export const userRoutes = express.Router();

console.log("Inside User route");

userRoutes.get("/data", odds);

userRoutes.get("/checkBalance/:walletAddress", checkBalance);

userRoutes.post("/checkTransfer", checkTransfer);

userRoutes.get("/test", testAPI);
