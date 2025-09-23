import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
const URL = import.meta.env.VITE_BACKEND_URL;

interface BetHistoryInterface{
    id: string;
    VjudgeUserId: string;
    stake: number;
    multiplier: number;
    walletAddress: string;
}

interface AxiosResponseInterface{
  balance: number;
  bets: BetHistoryInterface[]
}

export const useWalletBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [betHistory, setBetHistory] = useState<BetHistoryInterface[]>([]); 
  const wallet = useWallet();

  // console.log("Inside UserWalletBalance");
  // ✅ Fetch site balance from backend whenever wallet connects
  //this will make sure to give the balance as soon as the wallet is connected but what about when the user makes more transfer ?
  
  useEffect(() => {
    const fetchSiteBalance = async () => {
      if (wallet.publicKey) {
        try {
          //No need of this
          // First save the wallet address
          // await fetch(`${URL}/user/saveWallet`, {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({ walletAddress: wallet.publicKey.toBase58() }),
          // });

          // Then get the user's actual balance from database

          const response = await axios.get<AxiosResponseInterface>(`${URL}/user/checkBalance/${wallet.publicKey.toBase58()}`);

          if (response.data && response.data.balance !== undefined) {
            setBetHistory(response.data.bets);
            setBalance(response.data.balance);            
          } else {
            setBalance(0);
          }
        } catch (err) {
          // console.error("Error fetching site balance:", err);
          setBalance(0);
        }

      } else {
        setBalance(null);
        setBetHistory([]);
      }
    };

    fetchSiteBalance();
  }, [wallet.publicKey]);

  //this function will take care when the user sends more money to the app after connecting the wallet
  const refreshSiteBalance = async () => {
    if (!wallet.publicKey){
      setBetHistory([]);
      return;
    } 
    
    try {
      const response = await axios.get<AxiosResponseInterface>(`${URL}/user/checkBalance/${wallet.publicKey.toBase58()}`);
      
      if (response.data && response.data.balance !== undefined) {
        setBalance(response.data.balance);
        setBetHistory(response.data.bets);
      } else {
        setBalance(0);
      }
    } catch (err) {
      // console.error("Error refreshing site balance:", err);
      setBalance(0);
    }
  };

  return { balance, refreshSiteBalance, betHistory };
};

// Shared SOL formatter: integers -> no decimals, decimals -> up to 4
export function formatSol(value: any) {
  if (value === null || value === undefined || isNaN(value)) return "--";
  const num = Number(value);
  if (Number.isInteger(num)) return String(num);
  // trim trailing zeros
  return Number(num.toFixed(4)).toString();
}
