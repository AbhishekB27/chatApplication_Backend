import express from "express";
import cors from 'cors'
import {chatData} from './data/data.js'
import dotenv from 'dotenv'
import router1 from "./routes/userRoute.js";
import connectDB from "./services/connectDB.js";
import router2 from "./routes/chatRoutes.js";
const app = express()
const PORT = process.env.PORT || 8080
app.use(express.json())
app.use(cors())
dotenv.config()
connectDB()
app.use('/api/v1/user',router1)
app.use('/api/v1/chat',router2)
app.listen(PORT,()=>{
    console.log(`server is listening on ${PORT}`)
})