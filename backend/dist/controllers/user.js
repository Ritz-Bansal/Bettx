"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBalance = checkBalance;
exports.checkTransfer = checkTransfer;
exports.vJudge = vJudge;
exports.odds = odds;
exports.testAPI = testAPI;
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../database/db");
const dotenv_1 = require("dotenv");
const web3_js_1 = require("@solana/web3.js");
(0, dotenv_1.configDotenv)();
const SOLANA_DEVNET_URL = process.env.SOLANA_DEVNET_URL || " ";
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || " ";
const connection = new web3_js_1.Connection(SOLANA_DEVNET_URL, "confirmed");
function checkBalance(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const walletAddress = req.params.walletAddress;
        const allTransfers = yield db_1.prisma.user.findMany({
            where: {
                walletAddress: walletAddress,
            },
        });
        const allBets = yield db_1.prisma.bet.findMany({
            where: {
                walletAddress: walletAddress,
            },
        });
        let totalTransfers = 0;
        let totalBets = 0;
        let remainingBal = 0;
        for (let i = 0; i < allTransfers.length; i++) {
            totalTransfers += allTransfers[i].amount;
        }
        for (let i = 0; i < allBets.length; i++) {
            totalBets += allBets[i].stake;
        }
        remainingBal = totalTransfers - totalBets;
        return res.json({
            balance: remainingBal,
            bets: allBets,
        });
    });
}
function checkTransfer(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const signature = req.body.signature;
        if (!signature) {
            return res.status(400).json({
                message: "Transaction signature is required",
            });
        }
        try {
            const existingPayment = yield db_1.prisma.user.findFirst({
                where: {
                    signature: signature,
                },
            });
            if (existingPayment) {
                return res.status(200).json({
                    message: "Transaction already confirmed, Hack mat karo bhai",
                    payment: existingPayment,
                });
            }
            const tx = yield connection.getParsedTransaction(signature, {
                maxSupportedTransactionVersion: 0,
                commitment: "confirmed",
            });
            if (!tx) {
                return res
                    .status(404)
                    .json({ error: "Transaction not found or not confirmed yet" });
            }
            let transferFound = false;
            let sender = null;
            let amountLamports = 0;
            let destination, source, lamports;
            for (let i = 0; i < tx.transaction.message.instructions.length; i++) {
                let instruction = tx.transaction.message.instructions[i];
                if (instruction.programId.toString() ===
                    "11111111111111111111111111111111" &&
                    instruction.parsed &&
                    instruction.parsed.type === "transfer") {
                    destination = instruction.parsed.info.destination;
                    source = instruction.parsed.info.source;
                    lamports = instruction.parsed.info.lamports;
                    if (destination === WALLET_ADDRESS.toString()) {
                        transferFound = true;
                        sender = source;
                        amountLamports = lamports;
                        break;
                    }
                }
            }
            if (!transferFound) {
                return res.status(400).json({
                    error: "No valid transfer to your wallet found in this transaction",
                });
            }
            const amountSol = amountLamports / web3_js_1.LAMPORTS_PER_SOL;
            try {
                yield db_1.prisma.user.create({
                    data: {
                        amount: amountSol,
                        walletAddress: source,
                        signature: signature,
                    },
                });
                const allTxns = yield db_1.prisma.user.findMany({
                    where: {
                        walletAddress: source,
                    },
                });
                let totalBalance = 0;
                for (let i = 0; i < allTxns.length; i++) {
                    totalBalance += allTxns[i].amount;
                }
                return res.json({
                    message: "Transfer Successfull",
                    balance: totalBalance,
                    amount: amountSol,
                });
            }
            catch (error) {
                return res.json({
                    message: "Error when updating the balance",
                });
            }
        }
        catch (error) {
            return res.json({
                message: "Error while confirming the transaction",
            });
        }
    });
}
function vJudge() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://vjudge.net/contest/rank/single/748510`);
            let duration = response.data.length;
            duration = duration / 1000;
            const participants = response.data.participants;
            const submissions = response.data.submissions;
            const partiArray = Object.entries(participants);
            const submiArray = Object.entries(submissions);
            let rank = [];
            partiArray.map((participant) => {
                const res = submiArray.filter((submission) => submission[1][0].toString() == participant[0].toString());
                res.sort((a, b) => a[1][3] - b[1][3]);
                let questions = [];
                let score = 0;
                let time = 0;
                res.map((data) => {
                    if (data[1][2] == 0 && data[1][3] <= duration) {
                        let count = 0;
                        for (let i = 0; i < res.length; i++) {
                            if (res[i][1][1] == data[1][1] &&
                                res[i][1][2] == 1 &&
                                res[i][1][3] <= duration) {
                                count++;
                                if (count <= 1) {
                                    time += 1200;
                                }
                            }
                        }
                    }
                    else if (data[1][2] == 1 && data[1][3] <= duration) {
                        if (questions.includes(data[1][1])) {
                        }
                        else {
                            questions.push(data[1][1]);
                            time += data[1][3];
                            score++;
                        }
                    }
                });
                if (time != 0) {
                    rank.push({
                        name: participant[1][0],
                        penalty: time,
                        score: score,
                    });
                }
            });
            rank.sort((a, b) => {
                if (a.score !== b.score) {
                    return b.score - a.score;
                }
                return a.penalty - b.penalty;
            });
            let id = 1;
            rank.map((data) => {
                data.rankId = id;
                id++;
            });
            return rank;
        }
        catch (e) {
            console.log(e);
            console.log("Error");
            return [];
        }
    });
}
function odds(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const ranks = yield vJudge();
        return res.json({
            ranks: ranks,
        });
    });
}
function testAPI(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Inside the testAPI");
        const ress = yield axios_1.default.get("https://jsonplaceholder.typicode.com/todos/1");
        const data = ress.data;
        console.log(data);
        return res.json({
            data: data,
        });
    });
}
