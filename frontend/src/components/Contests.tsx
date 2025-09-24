// import { useState } from "react";
import { useState } from "react";
import { formatSol } from "../hooks/useWalletBalance.js";

interface BetHistoryInterface {
    id: string;
    VjudgeUserId: string;
    stake: number;
    multiplier: number;
    walletAddress: string;
  
}

interface ContestBetHistoryInterface {
  betHistory: BetHistoryInterface[]
}

const Contests = (betHistory: ContestBetHistoryInterface) => {
  // const [betHistory, setBetHistory] = useState([]);
  // const [loading, setLoading] = useState(true);

  // const contests = [
  //   { id: 1, title: "Capture the Flag", status: "Upcoming" },
  //   { id: 2, title: "Hackathon 2077", status: "Ongoing" },
  //   { id: 3, title: "Dark Web Puzzle", status: "Upcoming" },
  // ];

  // console.log("Inside Contest");
  // console.log("Bethistory inside Contest: ", betHistory);
  // console.log("Bethistory length: ",betHistory.betHistory.length);
  return (
    <div className="contest-box">
      {/* <h2>Contests</h2>
      <ul>
        {contests.map((c) => (
          <li key={c.id}>
            <span>{c.title}</span>
            <span className={c.status === "Ongoing" ? "status ongoing" : "status upcoming"}>
              {c.status}
            </span>
          </li>
        ))}
      </ul> */}

      {/* this is Bet History Table */}
      {betHistory.betHistory.length > 0 &&  (
        <div className="bet-history">
          <h3>Bet History</h3>
          <div className="bet-table">
            <div className="bet-table-header">
              <div>Participant</div>
              <div>Stake(SOL)</div>
              <div>xValue</div>
              <div>Payout</div>
            </div>
            {betHistory.betHistory.map((bet: BetHistoryInterface) => (
              <div key={bet.id} className="bet-table-row">
                <div>{bet.VjudgeUserId}</div>
                <div>{formatSol(bet.stake)}</div>
                <div>{bet.multiplier.toFixed(2)}x</div>
                <div>${formatSol([bet.stake * bet.multiplier * 239])}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Contests;
