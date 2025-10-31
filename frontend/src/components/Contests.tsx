
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
  return (
    <div className="contest-box">
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
