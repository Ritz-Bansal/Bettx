import { Request, Response } from "express";
import { prisma } from "../database/db";
import { betInputs } from "../zod/inputs";
import { vJudge } from "./user";




interface betInterface {
  walletAdd: string;
  VJudgeUserId: string;
  stake: number;
}



export async function bet(req: Request<{}, {}, betInterface>, res: Response) {
  const walletAdd= req.body.walletAdd; 
  const VJudgeUserId = req.body.VJudgeUserId;
  const stake = req.body.stake;

  const InputsResponse = betInputs.safeParse({
    amount: stake,

  });

  if (InputsResponse.success) {
    try {
      const allTxns = await prisma.user.findMany({
        where: {
          walletAddress: walletAdd,
        },
      });

      const allBets = await prisma.bet.findMany({
        where: {
          walletAddress: walletAdd,
        },
      });

      let totalBalance: number = 0;
      let totalBetAmount: number = 0;

      for (let i = 0; i < allTxns.length; i++) {
        totalBalance += allTxns[i].amount;
      }

      for (let i = 0; i < allBets.length; i++) {
        totalBetAmount += allBets[i].stake;
      }

      let remainingBal: number = totalBalance - totalBetAmount;



      if (remainingBal >= stake) {
        const response = await prisma.bet.create({
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
      } else {
        return res.json({
          message: "Insufficient balance",
        });
      }
    } catch (error) {

      return res.json({
        message: "Error placing bet: ",
        error,
      });
    }
  } else {

    return res.json({
      message: InputsResponse.error.issues[0].message,
    });
  }
}

interface PaymentInterface {

  walletAdd: string;
  PlayerNameTheyBettedOn: string;
}

interface SplitInterface {
  name: string;
  MoneySplittedAmongPlayers: number;
  totalPoolInSOL: number;
  payEachWinnerInSOL: number;
}


export async function payment(req: Request, res: Response) {
  
  let payment: PaymentInterface[] = [];
  let split: SplitInterface[] = [];
  const ranks = await vJudge();
  const allBets = await prisma.bet.findMany();
  
  let totaPool: number = 0;

  for(let i = 0; i<allBets.length; i++){
    totaPool += allBets[i].stake;
  }

  const totalMonetToPay: number = (90/100)*totaPool; //90% of the total pool, 10% house ka profit
  const totalMoneyToPayFirst: number = (50/100)*totalMonetToPay;
  const totalMoneyToPaySecond: number = (30/100)*totalMonetToPay;
  const totalMoneyToPayThird: number = (20/100)*totalMonetToPay;
  const MoneyToSplitArray = [totalMoneyToPayFirst, totalMoneyToPaySecond, totalMoneyToPayThird];

  for (let i = 0; i < 3; i++) {
    let playerToSplitAcross: number = 0;
    const participantName: string = ranks[i].name;

    allBets.map((data: any) => {
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

  const TotalAmountBettedInSOl = await trial();

  res.json({
    totoalAmountBettedInSOL: TotalAmountBettedInSOl,
    totalMonetToPayInSOL: totalMonetToPay,
    splitInSOL: split,
    dump: payment,

  });
}


async function trial() {
  const allbets = await prisma.bet.findMany({})
  let SOL: number = 0;
  
  for(let i=0; i<allbets.length; i++){
    SOL += allbets[i].stake;
  }


  return SOL;
}
