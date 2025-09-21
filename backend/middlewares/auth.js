import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";

configDotenv();

export async function authMiddleware(req, res, next){
    const headers = req.headers.authorization.split(" ");
    // console.log(headers);
    const token = headers[1];
    const JWT_SECRET = process.env.JWT_SECRET;
    try{
        const id = jwt.verify(token, JWT_SECRET);
        req.id = id;
        next()
    }catch(error){
        console.log("Error in try block");
    }


}