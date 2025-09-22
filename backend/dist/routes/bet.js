"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.betRoutes = void 0;
const express_1 = __importDefault(require("express"));
const bet_js_1 = require("../controllers/bet.js");
// import { authMiddleware } from "../middlewares/auth.js";
exports.betRoutes = express_1.default.Router();
// console.log("Inside Bet route");
exports.betRoutes.post("/bet", bet_js_1.bet);
exports.betRoutes.get("/payment", bet_js_1.payment); //manuaal payment for v1, baad mein automate karne ka tarika socho
//I need to do some authentication here so that only the participants of the current constest be able to enter their address
// betRoutes.post("/addWalletAddress", addWalletAddress);
