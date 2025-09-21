import axios from "axios";
// import jwt from "jsonwebtoken";
// import argon2 from "argon2";
import { prisma } from "../database/db.js";
import { configDotenv } from "dotenv"; //provides Tree shaking -- only imports config obejct only from the entire dotenv object -- ESM only suitable whereas importing dotnev imports  the entire dotenv object thus not valid right -- takes up a lot of space and useless also
// import { SigninInputs, SignupInputs, AmountInputs } from "../zod/inputs.js";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

configDotenv();

// const JWT_SECRET = process.env.JWT_SECRET;
const SOLANA_DEVNET_URL = process.env.SOLANA_DEVNET_URL;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const connection = new Connection(SOLANA_DEVNET_URL, "confirmed");
// const walletAddress = new PublicKey(WALLET_ADDRESS);

export async function checkBalance(req, res) {
  const walletAddress = req.params.walletAddress;

  const allTransfers = await prisma.user.findMany({
    where: {
      walletAddress: walletAddress,
    },
  });

  const allBets = await prisma.bet.findMany({
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
  // console.log("All the bets placed by a particular wallet: ",allBets);
  // console.log("Total number of bets placed: ", allBets.length);

  return res.json({
    balance: remainingBal,
    bets: allBets, //I am also sending all the bets the user has placed to the FE
  });
}

export async function checkTransfer(req, res) {
  const signature = req.body.signature;

  if (!signature) {
    return res.status(400).json({
      message: "Transaction signature is required",
    });
  }

  try {
    const existingPayment = await prisma.user.findFirst({
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

    const tx = await connection.getParsedTransaction(signature, {
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
    let sender = null;
    let amountLamports = 0;
    let destination, source, lamports;

    for (let i = 0; i < tx.transaction.message.instructions.length; i++) {
      let instruction = tx.transaction.message.instructions[i];
      if (
        instruction.programId.toString() ===
          "11111111111111111111111111111111" && // SystemProgram
        instruction.parsed &&
        instruction.parsed.type === "transfer"
      ) {
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

    const amountSol = amountLamports / LAMPORTS_PER_SOL;

    try {
      const response = await prisma.user.create({
        data: {
          amount: amountSol, //cannot increment if not updating -- also SOL will be stored in the Database
          walletAddress: source,
          signature: signature,
        },
      });

      const allTxns = await prisma.user.findMany({
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
        balance: totalBalance, // SOL bhejuga FE pe -- nhi
        amount: amountSol, //FE ko batau ki itna amount was added
      });
    } catch (error) {
      // console.log(error);
      return res.json({
        message: "Error when updating the balance",
      });
    }
  } catch (error) {
    // console.log(error);
    return res.json({
      message: "Error while confirming the transaction",
    });
  }
}

// 744015 -- Contest 3 id
// https://vjudge.net/contest/744877
//I can even get the live scores but then I need to hit the vjudge service again and again in some time and send the data to the client too again and againa i.e, WebSockets will be used
export async function vJudge() {
  const response = await axios.get(
    `https://vjudge.net/contest/rank/single/748510`
  );

  let duration = response.data.length; //contest length in UTC
  duration = duration / 1000; //duration in seconds

  const participants = response.data.participants;
  const submissions = response.data.submissions;

  const partiArray = Object.entries(participants); //converts the object into array of arrays -- eacch array contains two index 0 for key and 1 for value
  const submiArray = Object.entries(submissions); //agar key nai hoga toh automatically 1 se dena chalu kar dega

  let rank = [];

  partiArray.map((participant) => {
    const res = submiArray.filter(
      (submission) => submission[1][0] == participant[0]
    ); // filtering based on id
    res.sort((a, b) => a[1][3] - b[1][3]); //Sorting will be based on time and not on the order how questions were attempted as people can attempt questions howeever they want, but they cannot fool time

    let questions = [];
    let score = 0;
    let time = 0;

    res.map((data) => {
      if (data[1][2] == 0 && data[1][3] <= duration) {
        let count = 0;
        for (let i = 0; i < res.length; i++) {
          //idk, Is there any optimization possible here ?
          if (
            res[i][1][1] == data[1][1] &&
            res[i][1][2] == 1 &&
            res[i][1][3] <= duration
          ) {
            count++;
            if (count <= 1) {
              //this will ensure ki only first correct ans ka time penalty mein count ho
              time += 1200;
            }
          }
        }
        // time += 1200;
      } else if (data[1][2] == 1 && data[1][3] <= duration) {
        if (questions.includes(data[1][1])) {
          //as only ek baar hi and that too first time wale ka time count karna hai
        } else {
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

//todo -- Put the  multiplier in the participant table, that will be initial multi then I can change the multi according to the bets placed on a single player
export async function odds(req, res) {
  console.log("Inside the odds function");

  let odds = 1;
  const ranks = await vJudge();
  ranks.map((rank) => {
    odds += 0.1;
    const odd = odds.toFixed(2);
    rank.odds = odd;
  });

  console.log(ranks);
  return res.json({
    ranks: ranks,
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
