import { useState, useEffect } from "react";
import axios from "axios";

const URL: string = import.meta.env.VITE_BACKEND_URL;


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


  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await axios.get<AxiosResponseInterface>(`${URL}/user/data`);


        if (response.data.ranks) {
          setParticipants(response.data.ranks);
        } else {
          setParticipants([]);
        }
      } catch (error) {

        setParticipants([]);
      }
    };

    fetchParticipants();


    const timer = setInterval(fetchParticipants, 10000);


    return () => {
      clearInterval(timer);
    };
  }, []);

  return participants;
};
