import express from "express";
import { bet, payment } from "../controllers/bet.js";
// import { authMiddleware } from "../middlewares/auth.js";

export const betRoutes = express.Router();

// console.log("Inside Bet route");

betRoutes.post("/bet", bet);

betRoutes.get("/payment", payment); //manuaal payment for v1, baad mein automate karne ka tarika socho

//I need to do some authentication here so that only the participants of the current constest be able to enter their address
// betRoutes.post("/addWalletAddress", addWalletAddress);
