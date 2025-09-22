import express from "express";
import { userRoutes } from "./user";
import { betRoutes } from "./bet";

export const allRoutes = express.Router();

console.log("Inside the index.js inside routes folder");

allRoutes.use("/user", userRoutes);
allRoutes.use("/bet", betRoutes);
