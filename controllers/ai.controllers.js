import Embedding from "../models/embedding.models.js"
import { generateAIResponse, generateAIStream, generateEmbedding } from "../services/ai.services.js"
import { chunkTextByWords } from "../utils/chunkText.js"


export const chat=async(req,resp)=>{
    try{
        const{message}=req.body
        const resply=await generateAIResponse(message)
        resp.json({
            resply
        })
    }catch(err){
        console.log(err); 
    }
}


export const chatStream=async(req,resp)=>{
    try{
        const{message}=req.body
        const stream=await generateAIStream(message)
        resp.setHeader("Content-Type","text/plain; charset=utf-8");

        for await (const chunk of stream){
            resp.write(chunk.text)
        }
        resp.end()
    }catch(err){
        console.log(err);

        resp.status(500).json({
            error: "AI streaming failed"
        });
    }
}

export const chatEmbedding=async(req,resp)=>{
    try{
    const{text}=req.body
    const data=await generateEmbedding(text)
    resp.json(data)
    }catch(err){
        console.log(err)
    }
    
}

export const createEmbedding=async(req,resp)=>{
    try{
        const{text}=req.body

        const embedding=await generateEmbedding(text)
        resp.json({
            text,
            embedding
        })
    }catch(err){
        console.log(err)
        resp.status(500).json({
             error: "Embedding generation failed"
        })
    }
}

export const createChunkEmbedding=async(req,resp)=>{
    try{
        const{text}=req.body
        const chunks=await chunkTextByWords(text,5,2)
        const result=[]
        for (const chunk of chunks){
            const embedding=await generateEmbedding(chunk)
            result.push({
                text:chunk,
                embedding
            })
        }
        resp.json({
            result
        })

    }catch(err){
        console.log(err);

        resp.status(500).json({
            error: "Chunk embedding failed"
        });
    }
}


export const GenerateChunkEmbedding=async(req,resp)=>{
    try{
    const{text}=req.body
    const chunks=chunkTextByWords(text,5,2)
    const result=[]
    for(const chunk of chunks){
        const embedding=await generateEmbedding(chunk)
        const document=await Embedding.create({
        text:chunk,
        embedding
    })
     
    result.push(document)
    }
   
    resp.json({
        result
    })
    }catch(err){
        console.log(err);

        resp.status(500).json({
            error: "Chunk embedding failed"
        });
    }
}

export const SearchSimilarChunks=async(req,resp)=>{
    try{
        const{query}=req.body;

        const queryEmbedding=await generateEmbedding(query)

        const results=await Embedding.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector:queryEmbedding,
                    numCandidates: 50,
                    limit: 5
                }
            }
        ])
        resp.json({
            results
        })
    }catch(err){
        console.log(err);

        resp.status(500).json({
            error: "Vector search failed"
        });
    }
}