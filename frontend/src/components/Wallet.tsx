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

    if (!amount || amount <= 0) return alert("Enter a valid amount!");
    if (!wallet.publicKey) return alert("Please connect your wallet!");


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

      const signature: string = await wallet.sendTransaction(transaction, connection); //what is this doing ? -- getting the signature of the transaction
      await connection.confirmTransaction(signature, "confirmed");

      try {
        const verifyResponse = await axios.post<AxiosResposneInterface>(`${URL}/user/checkTransfer`, {
          signature: signature,
        });

        setLoader(false);


        if (verifyResponse.data.message === "Transfer Successfull") {
          await refreshSiteBalance(); 
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
        alert(
          `❌ Transaction sent (${signature}) but verification failed. Check console for details.`
        );
        setLoader(false);
      }

      setFundAmount("");
    } catch (err: unknown) {

      alert("❌ Transaction failed: " + err);
      setLoader(false);
    }
  };

  return (
    <>

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

            <button
              onClick={addFunds}
              disabled={!fundAmount || !wallet.publicKey}
            >
              {loader ? <span className="loader"></span> : wallet.publicKey ? "Send Transaction" : "Connect Wallet First"}

            </button>


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
