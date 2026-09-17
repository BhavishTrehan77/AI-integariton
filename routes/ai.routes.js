import express from 'express'
import {Answer, answer, chat, chatEmbedding, chatStream, createChunkEmbedding, createEmbedding, echat, functionCallControllers, GenerateChunkEmbedding, ragChat, SearchSimilarChunks, weatherController } from '../controllers/ai.controllers.js'



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
router.post("/functioncall",functionCallControllers)
router.post("/weathercontrol",weatherController)
router.post("/combinedAns",Answer)

export default router