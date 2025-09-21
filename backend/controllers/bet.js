import { all } from "axios";
import { prisma } from "../database/db.js";
import { betInputs } from "../zod/inputs.js";
import { vJudge } from "./user.js";
import { odds } from "./user.js";

//todo -- search button banano kuiki UI/UX designer chutiya hai
//todo -- the user must get all his total balance as soon as they logs in their wallet
//todo -- Test if after migration this works correctly or not


//I think I should validate the multiplier also in the BE as people can fuck me with FE sending me multiplier very very easily
export async function bet(req, res) {
  const walletAdd = req.body.walletAdd; //source wallet Addr i.e, jo bet karra hai
  const VJudgeUserId = req.body.VJudgeUserId;
  const stake = req.body.stake;
  let multiplier = req.body.multiplier; //TODO remove it

  // const ranks = await odds();
  let odds = 1;
  const ranks = await vJudge();
  ranks.map((rank) => {
    odds += 0.1;
    const odd = odds.toFixed(2);
    rank.odds = odd;
  });
  // console.log("Ranks using the odd function inside bet to get the multiplier: ", ranks)
  ranks.map((data) => {
    if(data.name == VJudgeUserId){
      multiplier = data.odds; 
      // console.log("Inside the if condition i.e, confirming the multiplier: ", multiplier);
    }
  })


  // console.log("Chekcing if the value of the multiplier is updated or not: ", multiplier);
  multiplier = parseFloat(multiplier);
  const InputsResponse = betInputs.safeParse({
    amount: stake,
    multiplier: multiplier,
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

      let totalBalance = 0;
      let totalBetAmount = 0;
      for (let i = 0; i < allTxns.length; i++) {
        totalBalance += allTxns[i].amount;
      }

      for (let i = 0; i < allBets.length; i++) {
        totalBetAmount += allBets[i].stake;
      }

      let remainingBal = totalBalance - totalBetAmount;

      // console.log("Balance: ", totalBalance);
      // console.log("Total Bet Amount: ", totalBetAmount);
      // console.log("Remaining Balance bedore the bet is placed: ", remainingBal);

      if (remainingBal >= stake) {
        const response = await prisma.bet.create({
          data: {
            VjudgeUserId: VJudgeUserId,
            stake: stake,
            multiplier: multiplier,
            walletAddress: walletAdd,
          },
        });

        remainingBal -= stake;

        return res.json({
          message: "Bet successfully placed",
          balance: remainingBal, // send the remaining balance after the BET is placed,
          // stake: stake        // Dicey if bhejna hai ki nai
        });
      } else {
        return res.json({
          message: "Insufficient balance",
        });
      }
    } catch (error) {
      // console.log(error);
      return res.json({
        message: "Error placing bet: ",
        error,
      });
    }
  } else {
    // console.log(InputsResponse.error.issues[0].message);
    return res.json({
      message: InputsResponse.error.issues[0].message,
    });
  }
}

//contest Id deni padegi of the current contest --> correct aara hai bhai
export async function payment(req, res) {
  let payment = [];
  const ranks = await vJudge();
  // console.log(ranks);
  // console.log("ranks of 0th index", ranks[0]);

  const allBets = await prisma.bet.findMany({});
  let totalMonetToPay = 0;
  // let totalMoneyStakedByRithvik = 0;

  // Only rank1, rank2 and rank3 ko payment jayegi bro
  for (let i = 0; i < 3; i++) {
    const participantName = ranks[i].name;
    // I cannot put toFixed(2) as this is SOL, people will put in decimal only --< this has 13 decimals and Solana hai 9 so life is good
    allBets.map((data) => {
      // const money = data.stake
      // totalMoneyStakedByRithvik += money;
      if (data.VjudgeUserId == participantName) {
        const pay = data.stake * data.multiplier;        
        // console.log("Money before adding in the total Money pot: ", pay.toFixed(2));
        totalMonetToPay += pay;
        payment.push({
          pay: `$${pay}`,
          walletAdd: data.walletAddress,
          name: data.VjudgeUserId, // Rakho mat rakho no farak bro
        });
      }
    });
  }
  console.log("Logs inside the payment function inside the bet controller");
  console.log("Total money to pay in SOL: ",totalMonetToPay);
  console.log("Total money to pay in USD: ", totalMonetToPay*239);

  res.json({
    dump: payment,
    totalMonetToPay: totalMonetToPay*239,
    // totalMoneyStakedByRithvik: totalMoneyStakedByRithvik*239
  });
}

//amount in SOL --> total amout betted in SOL -- correct hai yeh 
async function trial(){
  const allbets = await prisma.bet.findMany({})
  let SOL = 0;
  for(let i=0; i<allbets.length; i++){
    SOL += allbets[i].stake;
  }

  console.log("Logs inside the trial function inside the bet controller");
  console.log("Amount betted in SOL: ", SOL);
  console.log("Amount betted in dollars: ", SOL*239);

}
trial();


//1.21
//0.24
//0.845


//Good for V2, but not for V1
// export async function addWalletAddress(req,res){
//     const vJudgeUsername = req.body.vJudgeUsername;
//     const walletAddressParticipant = req.body.walletAddressParticipant;

//     try{
//       const allBets = await prisma.bet.updateMany({
//         where: {
//           VjudgeUserId: vJudgeUsername
//         },
//         data: {
//           walletAddressParticipant: walletAddressParticipant
//         }
//       })

//       // allBets.map(bet => {
//       //   bet.walletAddressParticipant  = walletAddressParticipant
//       // })

//       // console.log(allBets[0]);

//     return res.json({
//       message: "Wallet Address successfully added"
//     })

//     }catch(error){
//       return res.json({
//         message: "Error while adding wallet address ", error
//       })
//     }

// }
