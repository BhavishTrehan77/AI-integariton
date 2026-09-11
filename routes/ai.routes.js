import express from 'express'
import { chat, chatEmbedding, chatStream, createChunkEmbedding, createEmbedding, GenerateChunkEmbedding, SearchSimilarChunks } from '../controllers/ai.controllers.js'



const router=express.Router()



router.post("/chat",chat)
router.post("/chunk",chatStream)
router.post("/embedding",chatEmbedding)
router.post("/embeddings",createEmbedding)
router.post("/embeddings/chunks", createChunkEmbedding);
router.post("/generate",GenerateChunkEmbedding)
router.post("/ret",SearchSimilarChunks)

export default router