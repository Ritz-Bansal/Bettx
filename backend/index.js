import express from "express";
import { allRoutes } from "./routes/index.js";
import cors from "cors";
import { configDotenv } from "dotenv";

configDotenv();

const app = express();
const port = process.env.PORT;

app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173", // for local frontend
  "https://bettx-pied.vercel.app/", // for deployed frontend
];

app.use(allRoutes);

app.listen(port, () => {
  console.log("Listening on Port: ", port);
});
