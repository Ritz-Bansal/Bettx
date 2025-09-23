import { useState, useEffect } from "react";
import axios from "axios";
// import { configDotenv } from "dotenv";

// configDotenv();
const URL: string = import.meta.env.VITE_BACKEND_URL;
// console.log("URL is: ", URL);

interface Rank {
  name: string;
  penalty: number;
  score: number;
  rankId: number;
  odds: number;
}

interface AxiosResponseInterface{
  ranks: Rank[]
}

export const useParticipants = () => {
  const [participants, setParticipants] = useState<Rank[]>([]);

  // ✅ Fetch participants from backend
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await axios.get<AxiosResponseInterface>(`${URL}/user/data`);
        // console.log("Participants response:", response.data);

        if (response.data.ranks) {
          setParticipants(response.data.ranks);
        } else {
          setParticipants([]);
        }
      } catch (error) {
        // console.error("Error fetching participants:", error);
        setParticipants([]);
      }
    };
    // Initial fetch
    fetchParticipants();

    // Live polling every 10 seconds
    const timer = setInterval(fetchParticipants, 10000);

    // Cleanup on unmount
    return () => {
      clearInterval(timer);
    };
  }, []);

  return participants;
};
