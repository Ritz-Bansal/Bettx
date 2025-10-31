import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
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

  const [amountByParticipant, setAmountByParticipant] = useState<AmountByParticipantInterface>({});
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);

  const wallet = useWallet();


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

      const participant = participants.find((p) => p.rankId === participantId);

      const betResponse = await axios.post<AxiosResponseInterface>(`${URL}/bet/bet`, {
        walletAdd: wallet.publicKey.toBase58(),
        VJudgeUserId: participant?.name,
        stake: numericAmount,

      });

      if (betResponse.data.message === "Bet successfully placed") {
        alert("Bet successfully placed");

        await refreshSiteBalance();
        setAmountByParticipant({});
      } else {
        console.log("Inside Else");
        alert(betResponse.data.message || "Bet failed");
        setAmountByParticipant({});
      }
    } catch (err: unknown) {
      alert(err);
      setAmountByParticipant({});
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

                    }}


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

          </li>
        ))}
      </ul>
      
      

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
