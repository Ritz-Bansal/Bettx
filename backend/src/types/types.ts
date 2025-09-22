//types used in user.ts

interface UseParams {
  walletAddress: string;
}

interface parsed {
  parsed: {
    info: {
      destination: string;
      lamports: string;
      source: string;
    };
  };
}

interface vJudge {
  id: number;
  title: string;
  begin: number;
  length: number;
  isReplay: boolean;
  participants: {
    [key: string]: [];
  };
  submissions: [][]; //array of arrays
}

interface Rank {
  name: string;
  penalty: number;
  score: number;
  rankId: number;
  odds: number;
}

//types used in bet.ts
interface betInterface {
  walletAdd: string;
  VJudgeUserId: string;
  stake: number;
  multiplier: number;
}
