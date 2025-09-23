import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import axios from "axios";
const URL = import.meta.env.VITE_BACKEND_URL;

interface WalletInterface {
  balance: number | null;
  refreshSiteBalance: () => Promise<void>;
  showAddFundsModal: boolean;
  setShowAddFundsModal: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AxiosResposneInterface{
  message: string;
  balance: number;
  amount: number;
}

const Wallet = ({
  balance,  
  refreshSiteBalance,
  showAddFundsModal, // true or false
  setShowAddFundsModal, //can set it true or false
}: WalletInterface) => {

  const [fundAmount, setFundAmount] = useState("");
  const [fundSuccessMessage, setFundSuccessMessage] = useState("");
  const [loader, setLoader] = useState(false);

  const { connection } = useConnection();
  const wallet = useWallet();

  const addFunds = async () => {
    setLoader(true);

    const amount = parseFloat(fundAmount);
    // console.log("🔍 Starting addFunds with amount:", amount);

    if (!amount || amount <= 0) return alert("Enter a valid amount!");
    if (!wallet.publicKey) return alert("Please connect your wallet!");

    // console.log("🔍 Wallet connected:", wallet.publicKey.toBase58());

    try {
      const recipient = new PublicKey(
        "ACaRm2UvYudERXm9dHPZDVykLjKnJmV4pGU4bjzMaBrB"
      );

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: recipient,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      // console.log("🔍 Sending transaction...");
      const signature: string = await wallet.sendTransaction(transaction, connection); //what is this doing ? -- getting the signature of the transaction
      // console.log("🔍 Transaction sent, signature:", signature);

      // console.log("🔍 Confirming transaction...");
      await connection.confirmTransaction(signature, "confirmed");
      // console.log("🔍 Transaction confirmed!");

      // ✅ Show signature immediately after confirmation
      // alert(`✅ Transaction confirmed! Signature: ${signature}`);

      try {
        // console.log("🔍 Verifying with backend...");
        const verifyResponse = await axios.post<AxiosResposneInterface>(`${URL}/user/checkTransfer`, {
          signature: signature,
          // walletAddress: wallet.publicKey.toBase58(),
        });

        setLoader(false);

        // console.log("🔍 Backend response:", verifyResponse.data);

        if (verifyResponse.data.message === "Transfer Successfull") {
          await refreshSiteBalance(); //if the transfer is successful then the site balance has to be updated
          setFundSuccessMessage(
            `Funds added successfully! Amount: ${verifyResponse.data.amount} SOL`
          );
          alert(
            `✅ Verification successful! Amount: ${verifyResponse.data.amount} SOL`
          );
        } else {
          alert(
            "❌ Transaction verification failed: " + verifyResponse.data.message
          );

        }
      } catch (verifyError) {
        // console.error("❌ Verification error:", verifyError);
        alert(
          `❌ Transaction sent (${signature}) but verification failed. Check console for details.`
        );
        setLoader(false);
      }

      setFundAmount("");
    } catch (err: unknown) {
      // console.error("❌ Transaction failed:", err);
      alert("❌ Transaction failed: " + err);
      setLoader(false);
    }
  };

  return (
    <>
      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddFundsModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAddFundsModal(false)}
              className="close-btn-left"
            >
              
            </button>
            <h3>Add Funds</h3>
            <p
              style={{ fontSize: "14px", marginBottom: "15px", color: "#888" }}
            >
              Send SOL to: ACaRm2UvYudERXm9dHPZDVykLjKnJmV4pGU4bjzMaBrB
            </p>
            <input
              type="number"
              placeholder="Amount in SOL"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              step="0.01"
              min="0"
            />
            {/* Need to add a loader after the button is clicked */}
            <button
              onClick={addFunds}
              disabled={!fundAmount || !wallet.publicKey}
            >
              {loader ? <span className="loader"></span> : wallet.publicKey ? "Send Transaction" : "Connect Wallet First"}

            </button>

            {/* ✅ Small success message instead of alert */}
            {fundSuccessMessage && (
              <p
                style={{ fontSize: "13px", color: "green", marginTop: "10px" }}
              >
                {fundSuccessMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Balance Display */}
      <div className="balance-display">
        {wallet.publicKey && balance ? (
          <span>Site Balance: {balance?.toFixed(2)} SOL</span>
        ) : (
          <span>Site Balance: --</span>
        )}
      </div>
    </>
  );
};

export default Wallet;
