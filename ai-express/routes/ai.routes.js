import express from 'express'
import {AgentkeThrough, analyzeImageController, analyzePDFController, Answer, answer, chat, chatEmbedding, chatStream, createChunkEmbedding, createEmbedding, echat, filterSearch, functionCallControllers, GenerateChunkEmbedding, HybridSearch, KeywordSearch, pdfRagController, pdfStore, planningController, ragChat, reciprocalRankFusuion, weatherController } from '../controllers/ai.controllers.js'
import { analyzePDF, pdfRag } from '../services/ai.services.js'



const router=express.Router()



router.post("/chat",chat)
router.post("/chunk",chatStream)
router.post("/embedding",chatEmbedding)
router.post("/embeddings",createEmbedding)
router.post("/embeddings/chunks", createChunkEmbedding);
router.post("/generate",GenerateChunkEmbedding)
router.post("/ret",KeywordSearch)
router.post("/filterRag",filterSearch)
router.post("/answer",ragChat)
router.post("/expandQuery",echat)
router.post("/payal",answer)
router.post("/fast-chat",answer)
router.post("/functioncall",functionCallControllers)
router.post("/weathercontrol",weatherController)
router.post("/rrf",HybridSearch)
router.post("/combinedAns",Answer)
router.post("/planningexecution",planningController)
router.post("/agent",AgentkeThrough)
router.post("/image",analyzeImageController)
router.post("/pdf",analyzePDFController)
router.post("/storepdfthings",pdfStore)
router.post("/pdfRagAns",pdfRagController)

export default router