import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Navbar = ({ onAddFunds, participantsCount }) => {
  return (
    <nav className="navbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div className="logo" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span> 100xStake</span>
        {typeof participantsCount === 'number' && (
          <span style={{
            background: "#1e90ff",
            color: "#fff",
            borderRadius: "12px",
            padding: "2px 10px",
            fontSize: "12px"
          }}>
            Live: {participantsCount}
          </span>
        )}
      </div>
      <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <button className="signature-btn" onClick={onAddFunds}>
          Add Funds
        </button>
        <WalletMultiButton />
      </div>
    </nav>
  );
};

export default Navbar;
