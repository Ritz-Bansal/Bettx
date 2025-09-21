import { useState, useEffect } from "react";
import axios from "axios";
// import { configDotenv } from "dotenv";

// configDotenv();
const URL = import.meta.env.VITE_BACKEND_URL;
// console.log("URL is: ", URL);

export const useParticipants = () => {
  const [participants, setParticipants] = useState([]);

  // ✅ Fetch participants from backend
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await axios.get(`${URL}/user/data`);
        console.log("Participants response:", response.data);

        if (response.data.ranks) {
          setParticipants(response.data.ranks);
        } else if (response.data.dumped) {
          setParticipants(response.data.dumped);
        } else {
          setParticipants([]);
        }
      } catch (error) {
        console.error("Error fetching participants:", error);
        setParticipants([]);
      }
    };
    // Initial fetch
    fetchParticipants();

    // Live polling every 5 seconds
    const timer = setInterval(fetchParticipants, 5000);

    // Cleanup on unmount
    return () => {
      clearInterval(timer);
    };
  }, []);

  return participants;
};
