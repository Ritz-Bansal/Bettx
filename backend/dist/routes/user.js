"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
exports.userRoutes = express_1.default.Router();
console.log("Inside User route");
exports.userRoutes.get("/data", user_1.odds);
exports.userRoutes.get("/checkBalance/:walletAddress", user_1.checkBalance);
exports.userRoutes.post("/checkTransfer", user_1.checkTransfer);
exports.userRoutes.get("/test", user_1.testAPI);
