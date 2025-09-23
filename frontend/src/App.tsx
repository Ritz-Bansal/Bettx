import React, { useState, useEffect } from "react";
// import axios from "axios";

import {
  ConnectionProvider,
  WalletProvider,
  // useWallet,
} from "@solana/wallet-adapter-react";

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

// import { BaseWalletAdapter } from "@solana/wallet-adapter-base";
import {
  BaseWalletAdapter,
  // WalletName,
  WalletReadyState,
} from "@solana/wallet-adapter-base";
import type {
  Transaction,
  VersionedTransaction,
  PublicKey,
  TransactionSignature,
  Connection,
  SendOptions,
} from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./App.css";
// import "./index.module.css"
// import "./index.css";

// Import components
import Navbar from "./components/Navbar.js";
import Contests from "./components/Contests.js";
import Betting from "./components/Betting.js";
import Wallet from "./components/Wallet.js";

// Import hooks
import { useWalletBalance } from "./hooks/useWalletBalance.js";
import { useParticipants } from "./hooks/useParticipants.js";
const URL = import.meta.env.VITE_BACKEND_URL;

function BettingApp() {
  const [showAddFundsModal, setShowAddFundsModal] = useState<boolean>(false); //why this state
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
        // setBalance={() => {}} // Not needed since we use the hook
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
// class BackpackWalletAdapter extends BaseWalletAdapter {
//   constructor(name: string, url: string, icon: string) {
//     super(); //bhai this calls the constructor of the BaseWalletAdapter 
//     this.name = "Backpack";
//     this.url = "https://backpack.app";
//     this.icon =
//       "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8cGF0aCBkPSJNMTYgMTJIMjRWMjBIMTZWMTJaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo=";
//   }

//   async connect() {
//     if (!window.backpack) {
//       throw new Error("Backpack wallet not found");
//     }

//     const response = await window.backpack.connect();
//     this.emit("connect", response.publicKey);
//     return response;
//   }

//   async disconnect() {
//     if (window.backpack) {
//       await window.backpack.disconnect();
//     }
//     this.emit("disconnect");
//   }

//   async signTransaction(transaction) {
//     if (!window.backpack) {
//       throw new Error("Backpack wallet not found");
//     }
//     return await window.backpack.signTransaction(transaction);
//   }

//   async signAllTransactions(transactions) {
//     if (!window.backpack) {
//       throw new Error("Backpack wallet not found");
//     }
//     return await window.backpack.signAllTransactions(transactions);
//   }
// }
// export const BackpackWalletName = "Backpack" as WalletName<"Backpack">;

// ✅ Declare injected window provider
declare global {
  interface Window {
    backpack?: {
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signTransaction: <T extends Transaction | VersionedTransaction>(
        tx: T
      ) => Promise<T>;
      signAllTransactions: <T extends Transaction | VersionedTransaction>(
        txs: T[]
      ) => Promise<T[]>;
      sendTransaction?: (
        tx: Transaction | VersionedTransaction,
        connection: Connection,
        options?: SendOptions
      ) => Promise<TransactionSignature>;
    };
  }
}

export class BackpackWalletAdapter extends BaseWalletAdapter {
  
  name: any = "Backpack";
  url = "https://backpack.app";
  icon =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8cGF0aCBkPSJNMTYgMTJIMjRWMjBIMTZWMTJaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo=";

  // Required fields
  readyState: WalletReadyState =
    typeof window !== "undefined" && window.backpack
      ? WalletReadyState.Installed
      : WalletReadyState.NotDetected;

  publicKey: PublicKey | null = null;
  connecting = false;
  supportedTransactionVersions: ReadonlySet<"legacy" | 0> | null = new Set([
    "legacy",
    0,
  ]);

  async connect(): Promise<void> {
    if (!window.backpack) throw new Error("Backpack wallet not found");

    this.connecting = true;
    try {
      const { publicKey } = await window.backpack.connect();
      this.publicKey = publicKey;
      (this as any).emit("connect", publicKey);
    } finally {
      this.connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (window.backpack) {
      await window.backpack.disconnect();
    }
    this.publicKey = null;
    (this as any).emit("disconnect");
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    tx: T
  ): Promise<T> {
    if (!window.backpack) throw new Error("Backpack wallet not found");
    return await window.backpack.signTransaction(tx);
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: T[]
  ): Promise<T[]> {
    if (!window.backpack) throw new Error("Backpack wallet not found");
    return await window.backpack.signAllTransactions(txs);
  }

  async sendTransaction<T extends Transaction | VersionedTransaction>(
    tx: T,
    connection: Connection,
    options?: SendOptions
  ): Promise<TransactionSignature> {
    if (window.backpack?.sendTransaction) {
      // ✅ If wallet provides sendTransaction, delegate
      return await window.backpack.sendTransaction(tx, connection, options);
    }

    // ✅ Fallback: sign + send manually
    const signedTx = await this.signTransaction(tx);
    return await (connection as any).sendTransaction(
      signedTx as Transaction,
      options ? { skipPreflight: options.skipPreflight } : {}
    );
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
