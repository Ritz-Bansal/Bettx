"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("./routes/index");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
const port = process.env.PORT;
console.log("Inside the main index.js");
app.use(express_1.default.json());
const allowedOrigins = [
    "http://localhost:5173", // for local frontend
    "https://bettx-pied.vercel.app/", // for deployed frontend
];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(index_1.allRoutes);
app.listen(port, () => {
    console.log("Listening on Port: ", port);
});
