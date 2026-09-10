import express from 'express'
import { chat, chatStream } from '../controllers/ai.controllers.js'

const router=express.Router()



router.post("/chat",chat)
router.post("/chunk",chatStream)



export default router