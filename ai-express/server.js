import 'dotenv/config'
import express from 'express'
import router from './routes/ai.routes.js'
import routes from './routes/User.routes.js'
import { connection } from './config/db.js'

const app=express()

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
    if (req.method === "OPTIONS") return res.sendStatus(200)
    next()
})

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

app.use("/api/v1",router)
app.use("/api/auth",routes)

await connection()
console.log(process.env.AccKey)

app.listen(3000, () => {
    console.log("Server running on port 3000")
})
