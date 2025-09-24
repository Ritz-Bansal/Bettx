"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.betInputs = exports.AmountInputs = exports.SigninInputs = exports.SignupInputs = void 0;
const zod_1 = __importDefault(require("zod"));
exports.SignupInputs = zod_1.default.object({
    name: zod_1.default.string(),
    email: zod_1.default.email({ error: "Enter valid email" }),
    password: zod_1.default.string().min(3, { error: "Minimum length 3 requried bro" })
});
exports.SigninInputs = zod_1.default.object({
    email: zod_1.default.email({ error: "Enter valid email" }),
    password: zod_1.default.string().min(3, { error: "Remember, Minimum length 3" })
});
exports.AmountInputs = zod_1.default.object({
    amount: zod_1.default.number().int({ error: "Give integer bro" }),
    walletAddress: zod_1.default.string()
});
exports.betInputs = zod_1.default.object({
    amount: zod_1.default.number().min(0.05),
});
