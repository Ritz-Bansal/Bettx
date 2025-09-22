"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("./user");
const bet_1 = require("./bet");
exports.allRoutes = express_1.default.Router();
console.log("Inside the index.js inside routes folder");
exports.allRoutes.use("/user", user_1.userRoutes);
exports.allRoutes.use("/bet", bet_1.betRoutes);
