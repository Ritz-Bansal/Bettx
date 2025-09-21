import express from "express";
import { userRoutes } from "./user.js";
import { betRoutes } from "./bet.js";

export const allRoutes = express.Router();

allRoutes.use("/user", userRoutes);
allRoutes.use("/bet", betRoutes);
