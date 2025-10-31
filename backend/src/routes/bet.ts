import express from "express";
import { bet, payment } from "../controllers/bet.js";


export const betRoutes = express.Router();



betRoutes.post("/bet", bet);

betRoutes.get("/payment", payment); 

