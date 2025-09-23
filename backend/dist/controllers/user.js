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
const dotenv_1 = require("dotenv"); //provides Tree shaking -- only imports config obejct only from the entire dotenv object -- ESM only suitable whereas importing dotnev imports  the entire dotenv object thus not valid right -- takes up a lot of space and useless also
// import { SigninInputs, SignupInputs, AmountInputs } from "../zod/inputs.js";
const web3_js_1 = require("@solana/web3.js");
(0, dotenv_1.configDotenv)();
// const JWT_SECRET = process.env.JWT_SECRET;
//Isko Theek karo
const SOLANA_DEVNET_URL = process.env.SOLANA_DEVNET_URL || " ";
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || " ";
const connection = new web3_js_1.Connection(SOLANA_DEVNET_URL, "confirmed");
function checkBalance(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const walletAddress = req.params.walletAddress;
        //iss wallet address se jitne bhi trnsactions aaye hai uska record
        const allTransfers = yield db_1.prisma.user.findMany({
            where: {
                walletAddress: walletAddress,
            },
        });
        //iss wallet address ne jitne bhi bets ki hai uska record
        const allBets = yield db_1.prisma.bet.findMany({
            where: {
                walletAddress: walletAddress,
            },
        });
        let totalTransfers = 0;
        let totalBets = 0;
        let remainingBal = 0;
        //total money transferrred
        for (let i = 0; i < allTransfers.length; i++) {
            totalTransfers += allTransfers[i].amount;
        }
        //total money spent in betting
        for (let i = 0; i < allBets.length; i++) {
            totalBets += allBets[i].stake;
        }
        remainingBal = totalTransfers - totalBets;
        // console.log("All the bets placed by a particular wallet: ",allBets);
        // console.log("Total number of bets placed: ", allBets.length);
        return res.json({
            balance: remainingBal,
            bets: allBets, //I am also sending all the bets the user has placed to the FE
        });
    });
}
// type ParsedInnerInstruction = {
//   instructions: (ParsedInstruction | PartiallyDecodedInstruction)[];
// };
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
                //checking if user mamu toh nai banara na same signature vapas bhejke
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
            //what will be the type here ??
            const tx = yield connection.getParsedTransaction(signature, {
                maxSupportedTransactionVersion: 0, //Solana has 2 forms of transactions -- legacy and version 0, nwo the thing is ki version 0
                //gives you ALT(Address Lookup Table) mtlb insted of storing 32 bytes of a account, they store only 1 byte i.e, good indexing of DB
                commitment: "confirmed",
            });
            if (!tx) {
                return res
                    .status(404)
                    .json({ error: "Transaction not found or not confirmed yet" });
            }
            let transferFound = false;
            let sender = null; //if the source is correct then string, else null
            let amountLamports = 0;
            let destination, source, lamports; //trust me TS, I will assign the value to source then only use it
            for (let i = 0; i < tx.transaction.message.instructions.length; i++) {
                let instruction = tx.transaction.message.instructions[i];
                // console.log("Logging instructions one by one: ",instruction);
                if (instruction.programId.toString() ===
                    "11111111111111111111111111111111" && // SystemProgram
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
                //transfer entry created in db
                yield db_1.prisma.user.create({
                    data: {
                        amount: amountSol, //cannot increment if not updating -- also SOL will be stored in the Database
                        walletAddress: source,
                        signature: signature,
                    },
                });
                //txns extracted to get cal total balance
                const allTxns = yield db_1.prisma.user.findMany({
                    where: {
                        walletAddress: source,
                    },
                });
                //finding the total balance of the user after the trasfer is successfull and then returning it to the user
                let totalBalance = 0;
                for (let i = 0; i < allTxns.length; i++) {
                    totalBalance += allTxns[i].amount;
                }
                return res.json({
                    message: "Transfer Successfull",
                    balance: totalBalance, // SOL bhejuga FE pe -- nhi
                    amount: amountSol, //FE ko batau ki itna amount was added
                });
            }
            catch (error) {
                // console.log(error);
                return res.json({
                    message: "Error when updating the balance",
                });
            }
        }
        catch (error) {
            // console.log(error);
            return res.json({
                message: "Error while confirming the transaction",
            });
        }
    });
}
function vJudge() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // console.log("before sending req");
            const response = yield axios_1.default.get(`https://vjudge.net/contest/rank/single/748510`);
            // console.log("after sending req");
            let duration = response.data.length; //contest length in UTC
            duration = duration / 1000; //duration in seconds
            const participants = response.data.participants;
            const submissions = response.data.submissions;
            const partiArray = Object.entries(participants); //converts the object into array of arrays -- eacch array contains two index 0 for key and 1 for value
            const submiArray = Object.entries(submissions); //agar key nai hoga toh automatically 1 se dena chalu kar dega
            let rank = [];
            partiArray.map((participant) => {
                //res ke paas ek particular participant ke sare submissions ka data hai
                const res = submiArray.filter((submission) => {
                    if ((submission[1]).length > 0) {
                        submission[1][0].toString() == participant[0];
                    }
                }); // filtering based on id
                res.sort((a, b) => a[1][3] - b[1][3]); //Sorting will be based on time and not on the order how questions were attempted as people can attempt questions howeever they want, but they cannot fool time
                let questions = [];
                let score = 0;
                let time = 0;
                res.map((data) => {
                    // if(data.length > 0){
                    if (data[1][2] == 0 && data[1][3] <= duration) {
                        let count = 0;
                        for (let i = 0; i < res.length; i++) {
                            //idk, Is there any optimization possible here ?
                            if (res[i][1][1] == data[1][1] &&
                                res[i][1][2] == 1 &&
                                res[i][1][3] <= duration) {
                                count++;
                                if (count <= 1) {
                                    //this will ensure ki only first correct ans ka time penalty mein count ho
                                    time += 1200;
                                }
                            }
                        }
                        // time += 1200;
                    }
                    else if (data[1][2] == 1 && data[1][3] <= duration) {
                        if (questions.includes(data[1][1])) {
                            //as only ek baar hi and that too first time wale ka time count karna hai
                        }
                        else {
                            questions.push(data[1][1]);
                            time += data[1][3];
                            score++;
                        }
                    }
                    // }
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
                    return b.score - a.score; // descending order bro
                }
                return a.penalty - b.penalty; // if same score, lower penalty first
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
            return [];
        }
    });
}
//todo -- Put the  multiplier in the participant table, that will be initial multi then I can change the multi according to the bets placed on a single player
function odds(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log("Inside the odds function");
        // let odds: number = 1;
        const ranks = yield vJudge();
        // ranks.map((rank) => {
        //   odds += 0.1;
        //   const odd: string = odds.toFixed(2);
        //   rank.odds = odd;
        // });
        // console.log(ranks);
        return res.json({
            ranks: ranks,
        });
    });
}
//remove this bhai
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
// More code
// async function bets(house){
//     const k = 1 + house*0.01;
//     const rankArray =  await vJudge(744015);
//     let strengths = [];
//     let probabs = [];
//     let odds = [];
//     let multiplier = [];
//     let i = 0;
//     let sum = 0;
//     rankArray.map(rank => {
//         strengths[i] = (1/rank.rankId); //shall I round it up to 2 digits only after decimal ??
//         sum += strengths[i];
//         i++;
//     })
//     for(let i=0; i<rankArray.length; i++){
//         probabs[i] = strengths[i]/sum;
//         odds[i] = 1/probabs[i];
//         multiplier[i] = (odds[i]/k);
//     }
//     console.log(multiplier);
// }
//Polling
//but actually no need as the FE will poll the BE by hitting the BE again and again
// let count = 0;
// setInterval(async ()=> {
//     const ranks = await vJudge();
//     console.log("Polling done : ", count);
//     console.log(ranks);
//     count++;
// },5000000);
// vJudge(744014);
// async function preContestRating(){
//     let contestIdArray = [739947,742104, 744015];
//     let n = contestIdArray.length;
//     let alpha = 0.6;
//     for(let i=0; i<n; i++){
//         const rank = await vJudge(contestIdArray[n-i]); // startting form the latest contest
//         let k = i+1;
//     }
// }
// preContestRating()
