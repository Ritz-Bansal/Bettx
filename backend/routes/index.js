import express from "express";
import { userRoutes } from "./user.js";
import { betRoutes } from "./bet.js";

export const allRoutes = express.Router();

console.log("Inside the index.js inside routes folder");

allRoutes.use("/user", userRoutes);
allRoutes.use("/bet", betRoutes);
