import React, { useState, useEffect } from "react";


import {
  ConnectionProvider,
  WalletProvider,

} from "@solana/wallet-adapter-react";

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";


import {
  BaseWalletAdapter,

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

import Navbar from "./components/Navbar.js";
import Contests from "./components/Contests.js";
import Betting from "./components/Betting.js";
import Wallet from "./components/Wallet.js";


import { useWalletBalance } from "./hooks/useWalletBalance.js";
import { useParticipants } from "./hooks/useParticipants.js";
const URL = import.meta.env.VITE_BACKEND_URL;

function BettingApp() {

  const [showAddFundsModal, setShowAddFundsModal] = useState<boolean>(false); //why this state
  const { balance, refreshSiteBalance, betHistory} = useWalletBalance();
  const participants = useParticipants();

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

      return await window.backpack.sendTransaction(tx, connection, options);
    }


    const signedTx = await this.signTransaction(tx);
    return await (connection as any).sendTransaction(
      signedTx as Transaction,
      options ? { skipPreflight: options.skipPreflight } : {}
    );
  }
}


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
