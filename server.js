import 'dotenv/config'
import express from 'express'
import router from './routes/ai.routes.js'
import { connection } from '../ai-express/config/db.js'



const app=express()
app.use(express.json())



app.use("/api/v1",router)




await connection()

app.listen(3000)