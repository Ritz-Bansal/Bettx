"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.betRoutes = void 0;
const express_1 = __importDefault(require("express"));
const bet_js_1 = require("../controllers/bet.js");
exports.betRoutes = express_1.default.Router();
exports.betRoutes.post("/bet", bet_js_1.bet);
exports.betRoutes.get("/payment", bet_js_1.payment);
