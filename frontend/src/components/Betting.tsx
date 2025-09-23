import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
// import { formatSol } from "../hooks/useWalletBalance";
// import { URL } from "../config";
const URL: string = import.meta.env.VITE_BACKEND_URL;

interface Rank {
  name: string;
  penalty: number;
  score: number;
  rankId: number;
  odds: number;
}

interface BettingInterface{
  participants: Rank[]
  refreshSiteBalance: () => Promise<void>;
}

interface AxiosResponseInterface{
  message: string;
  balance: number;
}

interface AmountByParticipantInterface{
  [key: string]: number;
}

const Betting = ({ participants, refreshSiteBalance }: BettingInterface) => {
  // const [bets, setBets] = useState({}); 
  const [amountByParticipant, setAmountByParticipant] = useState<AmountByParticipantInterface>({});
  // const [betHistory, setBetHistory] = useState([]); 
  // const [startTime] = useState(Date.now());
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);

  const wallet = useWallet();

  // Debug: Log participants
  // console.log("Participants in Betting component:", participants);
  // const quickAmounts = [10, 20, 30, 40, 50]; // commented out as requested

  const placeBet = async (participantId: number, amount :string) => {
    const numericAmount = parseFloat(amount);
    console.log("Numeric Amount: ", numericAmount);
    if (!numericAmount || numericAmount < 0.05) { 
      setShowInsufficientBalance(true);
      setTimeout(() => setShowInsufficientBalance(false), 3000);
      return;
    }
    if (!wallet.publicKey) return alert("Please connect your wallet!");

    try {
      //participant can be undefined as find returns the value of the first element in the provided array that satisfies the provided testing function. If no element satisfies the function, it returns undefined.
      const participant = participants.find((p) => p.rankId === participantId);

      const betResponse = await axios.post<AxiosResponseInterface>(`${URL}/bet/bet`, {
        walletAdd: wallet.publicKey.toBase58(),
        VJudgeUserId: participant?.name,
        stake: numericAmount,
        // multiplier: participant?.odds || 1.0,
      });

      if (betResponse.data.message === "Bet successfully placed") {
        alert("Bet successfully placed");
        // const secondsElapsed = Math.floor((Date.now() - startTime) / 1000);
        // const betTime = `${secondsElapsed}s`;
        // const betWithTime = { amount: numericAmount, time: betTime };

        // yeh galat hai bhai --? refresh karke aaya toh bhi dikhna chaiyeh
        // setBets((prev) => ({ ...prev, [participantId]: [...(prev[participantId] || []), betWithTime] }));

        // Add to bet history
        // const newBet = {
        //   id: Date.now() + Math.random(),
        //   participantName: participant.name,
        //   participantId: participantId, //rank of the participant
        //   amount: numericAmount,
        //   multiplier: parseFloat(participant.odds) || 1.0,
        //   potentialWinnings: (numericAmount * (parseFloat(participant.odds) * 239)),
        //   // timestamp: betTime
        // };
        // //this is in memory -- as the player visits after a while -- it will not show the bets he has placed
        // setBetHistory(prev => [newBet, ...prev]);
        // console.log("Setting the betHistory inside the betting component: ", setBetHistory);

        await refreshSiteBalance();
      } else {
        console.log("Inside Else");
        alert(betResponse.data.message || "Bet failed");
      }
    } catch (err: unknown) {
      // console.log("Inside catch");
      // console.error("Bet error:", err);
      alert(err);
    }
  };

  return (
    <div className="participants-box">
      <h2>Participants</h2>
      <ul>
        {participants.map((p, index) => (
          <li key={p.rankId || index} className="participant">
            <div className="participant-row">
              <span>{p.rankId || index + 1}. {p.name || "Unknown"} </span>
              <div className="betting">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  {/* Show multiplier first */}
                  {/* <span style={{ 
                    fontSize: "12px", 
                    color: "#00ff41", 
                    fontWeight: "bold",
                    background: "rgba(0,255,65,0.1)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "1px solid rgba(0,255,65,0.3)"
                  }}>
                    {(p.odds || 1.0).toFixed(2)}x
                  </span> */}
                  
                  {/* Input with base 0.05 SOL and min 0.05 */}
                  <input
                    type="number"
                    min={0.05}
                    step={0.01}
                    placeholder="Min 0.05 SOL"
                    value={amountByParticipant[p.rankId] ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      console.log("Value of: ",v);
                      console.log("Amount by Participant: ", amountByParticipant);
                      setAmountByParticipant((prev) => ({ ...prev, [p.rankId]: v }));
                      // type="";
                    }}

                    //bet in SOL wala button ka styling
                    style={{
                      width: "120px",
                      background: "#000",
                      border: "1px solid #22c55e",
                      color: "#eafff7",
                      padding: "8px 10px",
                      borderRadius: "8px"
                    }}
                  />
                  <button
                    className="bet-btn"
                    style={{
                      padding: "10px 14px",
                      fontSize: "12px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "#fff",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      const entered = amountByParticipant[p.rankId];
                      console.log("Value of Entered: ", entered);
                      const amountToBet = entered || 0;
                      placeBet(p.rankId, amountToBet.toString());
                    }}
                  >
                    Bet in SOL
                  </button>
                </div>
              </div>
            </div>

            {/* this is the bet table */}
            {/* {bets[p.rankId] && (
              
              <div className="bets-list">
                {console.log("Bet table data logged: ", bets)}
                <strong>Your Bets:</strong>
                <div className="bets-table">
                  <div className="bets-table-header">
                    <div>Amount (SOL)</div>
                    <div>Multiplier</div>
                    <div>Potential (USDC)</div>
                  </div>
                  {bets[p.rankId].map((b, i) => {
                    const betAmount = typeof b === 'object' ? b.amount : b;
                    const potentialSOL = betAmount * parseFloat(p.odds || 1.0);
                    const potentialUSDC = potentialSOL * 239; // Assuming 1 SOL = $239 USDC
                    // const bettorName = "You"; // Show "You" instead of wallet address --> Yeh kya tha Bhenchod
                    
                    return (
                      <div key={i} className="bets-table-row">
                        <div>{formatSol(betAmount)}</div>
                        <div>{parseFloat(p.odds || 1.0).toFixed(2)}x</div>
                        <div>${potentialUSDC.toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )} */}
          </li>
        ))}
      </ul>
      
      {/* this is Bet History Table
      {betHistory.length > 0 && (
        <div className="bet-history">
          <h3>Bet History</h3>  
          <div className="bet-table">
            <div className="bet-table-header">
              <div>Participant</div>
              <div>Bet Amount (SOL)</div>
              <div>Multiplier</div>
              <div>Potential Winnings (USD)</div>
            </div>
            {betHistory.map((bet) => (
              <div key={bet.id} className="bet-table-row">
                <div>{bet.participantName}</div>
                <div>{formatSol(bet.amount)}</div>
                <div>{bet.multiplier.toFixed(2)}x</div>
                <div>${formatSol(bet.potentialWinnings)}</div>
              </div>
            ))}
          </div>
        </div>
      )} */}
      
      {/* Beautiful Insufficient Balance Alert */}
      {showInsufficientBalance && (
        <div className="insufficient-balance-overlay">
          <div className="insufficient-balance-modal">
            <div className="alert-icon">⚠️</div>
            <h3>Insufficient Balance</h3>
            <p>Minimum bet is 0.05 SOL</p>
            <button 
              onClick={() => setShowInsufficientBalance(false)}
              className="alert-close-btn"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Betting;
