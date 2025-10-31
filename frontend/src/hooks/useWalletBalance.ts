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

  
  useEffect(() => {
    const fetchSiteBalance = async () => {
      if (wallet.publicKey) {
        try {

          const response = await axios.get<AxiosResponseInterface>(`${URL}/user/checkBalance/${wallet.publicKey.toBase58()}`);

          if (response.data && response.data.balance !== undefined) {
            setBetHistory(response.data.bets);
            setBalance(response.data.balance);            
          } else {
            setBalance(0);
          }
        } catch (err) {

          setBalance(0);
        }

      } else {
        setBalance(null);
        setBetHistory([]);
      }
    };

    fetchSiteBalance();
  }, [wallet.publicKey]);


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

      setBalance(0);
    }
  };

  return { balance, refreshSiteBalance, betHistory };
};


export function formatSol(value: any) {
  if (value === null || value === undefined || isNaN(value)) return "--";
  const num = Number(value);
  if (Number.isInteger(num)) return String(num);

  return Number(num.toFixed(4)).toString();
}
