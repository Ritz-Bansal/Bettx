//Hooks
//userParticipant
interface Rank {
  name: string;
  penalty: number;
  score: number;
  rankId: number;
  odds: number;
}

interface AxiosResponseInterface {
  ranks: Rank[];
}

//userWalletBalance
interface BetHistoryInterface {
  id: string;
  VjudgeUserId: string;
  stake: number;
  multiplier: number;
  walletAddress: string;
}

interface AxiosResponseInterface {
  balance: number;
  bets: BetHistoryInterface[];
}

//Components
//Contest.tsx
interface BetHistoryInterface {
  id: string;
  VjudgeUserId: string;
  stake: number;
  multiplier: number;
  walletAddress: string;
}

interface ContestBetHistoryInterface {
  betHistory: BetHistoryInterface[];
}

//Navbar.tsx
interface NavbarInterface {
  onAddFunds: () => boolean;
  participantsCount: number;
}

//Wallet.tsx
interface WalletInterface {
  balance: number;
  refreshSiteBalance: () => Promise<void>;
  showAddFundsModal: boolean;
  setShowAddFundsModal: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AxiosResposneInterface {
  message: string;
  balance: number;
  amount: number;
}

//Betting.tsx
interface Rank {
  name: string;
  penalty: number;
  score: number;
  rankId: number;
  odds: number;
}

interface BettingInterface {
  participants: Rank[];
  refreshSiteBalance: () => Promise<void>;
}
