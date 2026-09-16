import express from 'express'
import { answer, chat, chatEmbedding, chatStream, createChunkEmbedding, createEmbedding, echat, GenerateChunkEmbedding, ragChat, SearchSimilarChunks } from '../controllers/ai.controllers.js'



const router=express.Router()



router.post("/chat",chat)
router.post("/chunk",chatStream)
router.post("/embedding",chatEmbedding)
router.post("/embeddings",createEmbedding)
router.post("/embeddings/chunks", createChunkEmbedding);
router.post("/generate",GenerateChunkEmbedding)
router.post("/ret",SearchSimilarChunks)
router.post("/answer",ragChat)
router.post("/expandQuery",echat)
router.post("/payal",answer)

export default router