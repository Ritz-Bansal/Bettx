import axios from "axios";
import { Request, Response } from "express";
import { prisma } from "../database/db";
import { configDotenv } from "dotenv";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

configDotenv();

type secrets = string | undefined;


const SOLANA_DEVNET_URL: string = process.env.SOLANA_DEVNET_URL || " ";
const WALLET_ADDRESS: string = process.env.WALLET_ADDRESS || " ";
const connection = new Connection(SOLANA_DEVNET_URL, "confirmed");


interface UseParams {
  walletAddress: string;
}

export async function checkBalance(req: Request<UseParams>, res: Response) {
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

  let totalTransfers: number = 0;
  let totalBets: number = 0;
  let remainingBal: number = 0;


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
}

interface ParsedInterface {
  parsed?: {
    info: {
      destination: string;
      lamports: number;
      source: string;
    };
    type: string;
  };
  programId: PublicKey;
}


export async function checkTransfer(req: Request, res: Response) {
  const signature: string = req.body.signature;

  if (!signature) {
    return res.status(400).json({
      message: "Transaction signature is required",
    });
  }

  try {
    const existingPayment = await prisma.user.findFirst({

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
      maxSupportedTransactionVersion: 0, 

      commitment: "confirmed",
    });

    if (!tx) {
      return res
        .status(404)
        .json({ error: "Transaction not found or not confirmed yet" });
    }

    let transferFound: boolean = false;
    let sender: string | null = null; 
    let amountLamports: number = 0;
    let destination: string, source!: string, lamports: number; 

    for (let i = 0; i < tx.transaction.message.instructions.length; i++) {
      let instruction: ParsedInterface = tx.transaction.message.instructions[i];

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

    const amountSol: number = amountLamports / LAMPORTS_PER_SOL;

    try {

      await prisma.user.create({
        data: {
          amount: amountSol, 
          walletAddress: source,
          signature: signature,
        },
      });


      const allTxns = await prisma.user.findMany({
        where: {
          walletAddress: source,
        },
      });


      let totalBalance: number = 0;
      for (let i = 0; i < allTxns.length; i++) {
        totalBalance += allTxns[i].amount;
      }

      return res.json({
        message: "Transfer Successfull",
        balance: totalBalance,
        amount: amountSol, 
      });
    } catch (error) {

      return res.json({
        message: "Error when updating the balance",
      });
    }
  } catch (error) {

    return res.json({
      message: "Error while confirming the transaction",
    });
  }
}


interface vJudge {
  id: number;
  title: string;
  begin: number;
  length: number;
  isReplay: boolean;
  participants: {
    [key: string]: [];
  };
  submissions: [][]; //array of arrays
}

interface Rank {
  name: string;
  penalty: number;
  score: number;
  rankId?: number;
  odds?: string
}

interface ParticipantInterface{
  [key: string]: []
}

export async function vJudge() {

  try {

    const response = await axios.get<vJudge>(
      `https://vjudge.net/contest/rank/single/748510`
    );



    let duration: number = response.data.length; //contest length in UTC
    duration = duration / 1000; //duration in seconds

    const participants: ParticipantInterface = response.data.participants;
    const submissions: [][] = response.data.submissions;


    

    const partiArray : [string , []][] = Object.entries(participants); 
    const submiArray: [string , []][] = Object.entries(submissions); 

    let rank: Rank[] = [];

    partiArray.map((participant: [string, string[]]) => {
      const res: [string, number[]][]  = submiArray.filter((submission: [string, number[]]) =>  submission[1][0].toString() == participant[0].toString() ); // filtering based on id

      res.sort((a, b) => a[1][3] - b[1][3]); 

      let questions: number[] = [];
      let score = 0;
      let time = 0;

      res.map((data) => {

        if (data[1][2] == 0 && data[1][3] <= duration) {
          let count = 0;
          for (let i = 0; i < res.length; i++) {

            if (
              res[i][1][1] == data[1][1] &&
              res[i][1][2] == 1 &&
              res[i][1][3] <= duration
            ) {
              count++;
              if (count <= 1) {

                time += 1200;
              }
            }
          }

        } else if (data[1][2] == 1 && data[1][3] <= duration) {
          if (questions.includes(data[1][1])) {

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
  } catch (e) {
    console.log(e);
    console.log("Error");
    return [];
  }
}


export async function odds(req: Request, res: Response) {



  const ranks: Rank[]  = await vJudge();
  return res.json({
    ranks: ranks,
  });
}


