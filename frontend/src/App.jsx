import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import { BaseWalletAdapter } from "@solana/wallet-adapter-base";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./App.css";

// Import components
import Navbar from "./components/Navbar";
import Contests from "./components/Contests";
import Betting from "./components/Betting";
import Wallet from "./components/Wallet";

// Import hooks
import { useWalletBalance } from "./hooks/useWalletBalance";
import { useParticipants } from "./hooks/useParticipants";
const URL = import.meta.env.VITE_BACKEND_URL;

function BettingApp() {
  const [showAddFundsModal, setShowAddFundsModal] = useState(false); //why this state
  const { balance, refreshSiteBalance, betHistory } = useWalletBalance();
  const participants = useParticipants();
  // const [betHistory, setBetHistory] = useState([]); 
  // const wallet = useWallet();

  // Debug: Log participants
  // console.log("Participants in App.jsx:", participants);

  // ✅ Save wallet address to backend
  // useEffect(() => {
  //   const saveWalletAddress = async () => {
  //     if (!wallet.publicKey) return;
  //     try {
  //     const url = URL+"/user/saveWallet"
  //     await fetch(url, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ walletAddress: wallet.publicKey.toBase58() }),
  //     });
  //     console.log("Wallet address saved to backend");
  //   } catch (error) {
  //     console.error("Error saving wallet address:", error);
  //   }
  // };
  // saveWalletAddress();
  // }, [wallet.publicKey]);

  return (
    <div className="app-container">
      {/* Navbar */}
      <Navbar
        onAddFunds={() => setShowAddFundsModal(true)} // --> sets the state true when Add funds button is clicked
        participantsCount={participants?.length || 0}
      />

      {/* Wallet Component with Modal */}
      <Wallet
        balance={balance}
        setBalance={() => {}} // Not needed since we use the hook
        refreshSiteBalance={refreshSiteBalance}
        showAddFundsModal={showAddFundsModal}
        setShowAddFundsModal={setShowAddFundsModal}
      />

      {/* Body */}
      <div className="body-container">
        {/* Contests */}
        <Contests betHistory={betHistory} />

        {/* Betting */}
        <Betting
          participants={participants}
          refreshSiteBalance={refreshSiteBalance}
          // setBetHistory={setBetHistory}
        />
      </div>
      {/* Discreet disclaimer */}
      <div className="disclaimer">
        * If your participant uses ChatGPT or does not participate, you will
        lose all your money.
      </div>
    </div>
  );
}

// ✅ Custom Backpack Wallet Adapter
class BackpackWalletAdapter extends BaseWalletAdapter {
  constructor() {
    super();
    this.name = "Backpack";
    this.url = "https://backpack.app";
    this.icon =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8cGF0aCBkPSJNMTYgMTJIMjRWMjBIMTZWMTJaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo=";
  }

  async connect() {
    if (!window.backpack) {
      throw new Error("Backpack wallet not found");
    }

    const response = await window.backpack.connect();
    this.emit("connect", response.publicKey);
    return response;
  }

  async disconnect() {
    if (window.backpack) {
      await window.backpack.disconnect();
    }
    this.emit("disconnect");
  }

  async signTransaction(transaction) {
    if (!window.backpack) {
      throw new Error("Backpack wallet not found");
    }
    return await window.backpack.signTransaction(transaction);
  }

  async signAllTransactions(transactions) {
    if (!window.backpack) {
      throw new Error("Backpack wallet not found");
    }
    return await window.backpack.signAllTransactions(transactions);
  }
}

// ✅ Add real wallets (Phantom, Solflare, Backpack, etc.)
export default function App() {
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),
  ];

  return (
    <ConnectionProvider endpoint="https://api.devnet.solana.com">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BettingApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
