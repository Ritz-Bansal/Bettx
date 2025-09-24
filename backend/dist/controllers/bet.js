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
Object.defineProperty(exports, "__esModule", { value: true });
exports.bet = bet;
exports.payment = payment;
const db_1 = require("../database/db");
const inputs_1 = require("../zod/inputs");
const user_1 = require("./user");
function bet(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const walletAdd = req.body.walletAdd;
        const VJudgeUserId = req.body.VJudgeUserId;
        const stake = req.body.stake;
        const InputsResponse = inputs_1.betInputs.safeParse({
            amount: stake,
        });
        if (InputsResponse.success) {
            try {
                const allTxns = yield db_1.prisma.user.findMany({
                    where: {
                        walletAddress: walletAdd,
                    },
                });
                const allBets = yield db_1.prisma.bet.findMany({
                    where: {
                        walletAddress: walletAdd,
                    },
                });
                let totalBalance = 0;
                let totalBetAmount = 0;
                for (let i = 0; i < allTxns.length; i++) {
                    totalBalance += allTxns[i].amount;
                }
                for (let i = 0; i < allBets.length; i++) {
                    totalBetAmount += allBets[i].stake;
                }
                let remainingBal = totalBalance - totalBetAmount;
                if (remainingBal >= stake) {
                    const response = yield db_1.prisma.bet.create({
                        data: {
                            VjudgeUserId: VJudgeUserId,
                            stake: stake,
                            multiplier: 1.0,
                            walletAddress: walletAdd,
                        },
                    });
                    remainingBal -= stake;
                    return res.json({
                        message: "Bet successfully placed",
                        balance: remainingBal,
                    });
                }
                else {
                    return res.json({
                        message: "Insufficient balance",
                    });
                }
            }
            catch (error) {
                return res.json({
                    message: "Error placing bet: ",
                    error,
                });
            }
        }
        else {
            return res.json({
                message: InputsResponse.error.issues[0].message,
            });
        }
    });
}
function payment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let payment = [];
        let split = [];
        const ranks = yield (0, user_1.vJudge)();
        const allBets = yield db_1.prisma.bet.findMany();
        let totaPool = 0;
        for (let i = 0; i < allBets.length; i++) {
            totaPool += allBets[i].stake;
        }
        const totalMonetToPay = (90 / 100) * totaPool;
        const totalMoneyToPayFirst = (50 / 100) * totalMonetToPay;
        const totalMoneyToPaySecond = (30 / 100) * totalMonetToPay;
        const totalMoneyToPayThird = (20 / 100) * totalMonetToPay;
        const MoneyToSplitArray = [totalMoneyToPayFirst, totalMoneyToPaySecond, totalMoneyToPayThird];
        for (let i = 0; i < 3; i++) {
            let playerToSplitAcross = 0;
            const participantName = ranks[i].name;
            allBets.map((data) => {
                if (data.VjudgeUserId == participantName) {
                    playerToSplitAcross++;
                    payment.push({
                        walletAdd: data.walletAddress,
                        PlayerNameTheyBettedOn: data.VjudgeUserId,
                    });
                }
            });
            split.push({
                name: participantName,
                totalPoolInSOL: MoneyToSplitArray[i],
                MoneySplittedAmongPlayers: playerToSplitAcross,
                payEachWinnerInSOL: MoneyToSplitArray[i] / playerToSplitAcross,
            });
        }
        const TotalAmountBettedInSOl = yield trial();
        res.json({
            totoalAmountBettedInSOL: TotalAmountBettedInSOl,
            totalMonetToPayInSOL: totalMonetToPay,
            splitInSOL: split,
            dump: payment,
        });
    });
}
function trial() {
    return __awaiter(this, void 0, void 0, function* () {
        const allbets = yield db_1.prisma.bet.findMany({});
        let SOL = 0;
        for (let i = 0; i < allbets.length; i++) {
            SOL += allbets[i].stake;
        }
        console.log("Logs inside the trial function inside the bet controller");
        console.log("Amount betted in SOL: ", SOL);
        return SOL;
    });
}
