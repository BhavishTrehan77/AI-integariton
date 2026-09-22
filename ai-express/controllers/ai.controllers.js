import { properties } from "zod"
import { ai } from "../config/ai.js"
import Embedding from "../models/embedding.models.js"
import { addNumbers, agent, agentLoop, analyzeImage, analyzeImageStructure, analyzePDF, createPlan, executePlan, expandQuery, extractPdfText, functionCalling, generateAi, generateAIResponse, generateAIStream, generateEmbedding, generateTextResponse, getWeather, pdfRag, rewriteQuery, tools, weatherTool, processPdf, ProcessPdf, RagAnss } from "../services/ai.services.js"
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
        resp.status(500).json({
            error: "Chat failed"
        })
    }
}

export const answer=async(req,resp)=>{
    try{
    const{message}=req.body
    const reply=await generateAi(message)
    const ans=reply.text
    resp.json(ans)
    }catch(err){
        console.log(err)
        resp.status(500).json({
            error: "Answer failed"
        })
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
        resp.status(500).json({
            error: "Embedding failed"
        })
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
        const chunks=await chunkTextByWords(text,100,20)
        const result=[]
        for (const chunk of chunks){
            const embedding=await generateEmbedding(chunk)
            result.push({
                text:chunk,
                embedding:embedding,
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
    const{text,category,source}=req.body
    const chunks=chunkTextByWords(text,100,20)
    const result=[]
    for(const chunk of chunks){
        const embedding=await generateEmbedding(chunk)
            const document = await Embedding.create({
                text: chunk,
                embedding: embedding,
                category: category,
                source: source
            });
     
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

export const KeywordSearch=async(req,resp)=>{
    try{
        const{query}=req.body;

        // const queryEmbedding=await generateEmbedding(query)

        const results=await Embedding.aggregate([
            {
                $search:{
                    index:"text_search_index",
                    text:{
                        query:query,
                        path:"text"
                    }
                }
            },{$project: {
                text:1,
                score:{
                    $meta:"searchScore"
                }
            }
            },{
                $limit:5
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
export const filterSearch=async(req,resp)=>{
     try {
        const { query,category } = req.body;

        const queryEmbedding = await generateEmbedding(query);

        const results = await Embedding.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 50,
                    limit: 5,
                    filter: {
                        category:category
                    }
                }
            },
            {
                $project: {
                    text: 1,
                    source: 1,
                    page: 1,
                    score: {
                        $meta: "vectorSearchScore"
                    }
                }
            }
        ]);

        return resp.json({
            results
        });

    } catch (err) {
        console.log(err);

        return resp.status(500).json({
            error: "Filtered search failed"
        });
    }
};


export const ragChat = async (req, resp) => {
    try {
        const { query, source, filename } = req.body;
        const targetDoc = source || filename;
        const cleanName = targetDoc ? targetDoc.replace(/^.*[\\\/]/, '').trim() : null;

        const rewrittenQuery = await rewriteQuery(query);
        console.log("Original Query:", query);
        console.log("Rewritten Query:", rewrittenQuery);
        console.log("Target Document Filter:", cleanName);

        const queryEmbedding = await generateEmbedding(rewrittenQuery);

        const vectorSearchStage = {
            index: "vector_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 50,
            limit: 5
        };

        if (cleanName) {
            vectorSearchStage.filter = {
                source: {
                    $in: [cleanName, `uploads/${cleanName}`, `./uploads/${cleanName}`, targetDoc]
                }
            };
        }

        let results = [];
        try {
            results = await Embedding.aggregate([
                {
                    $vectorSearch: vectorSearchStage
                },
                {
                    $project: {
                        text: 1,
                        source: 1,
                        score: {
                            $meta: "vectorSearchScore"
                        }
                    }
                }
            ]);
        } catch (err) {
            console.warn("Atlas filter failed in ragChat, falling back to post-filtering:", err.message);
            const fallback = await Embedding.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "embedding",
                        queryVector: queryEmbedding,
                        numCandidates: 100,
                        limit: 30
                    }
                },
                {
                    $project: {
                        text: 1,
                        source: 1,
                        score: {
                            $meta: "vectorSearchScore"
                        }
                    }
                }
            ]);

            if (cleanName) {
                const filtered = fallback.filter(doc => {
                    if (!doc.source) return false;
                    const docBase = doc.source.replace(/^.*[\\\/]/, '').trim().toLowerCase();
                    return docBase === cleanName.toLowerCase() || doc.source.toLowerCase().includes(cleanName.toLowerCase());
                });
                results = filtered.length > 0 ? filtered.slice(0, 5) : fallback.slice(0, 5);
            } else {
                results = fallback.slice(0, 5);
            }
        }

        // 3. Keep top relevant chunks (adaptive threshold instead of dropping everything below 0.5)
        let relevantResult = results.filter(result => result.score >= 0.35);
        if (relevantResult.length === 0 && results.length > 0) {
            relevantResult = results.slice(0, 5);
        }

        // Direct document fallback if vector search returned 0 chunks
        if (relevantResult.length === 0 && cleanName) {
            const escapeRegex = cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const directChunks = await Embedding.find({
                source: { $regex: escapeRegex, $options: 'i' }
            }).limit(6).select('text source');
            if (directChunks.length > 0) {
                relevantResult = directChunks;
            }
        }

        // 5. Create context from relevant chunks
        const context = relevantResult
            .map(result => result.text)
            .filter(Boolean)
            .join("\n\n");

        // 6. Create helpful prompt for LLM
        const prompt = `You are an AI document analysis assistant.
Document: "${cleanName || 'Uploaded Document'}"

Document Content:
---
${context}
---

Question: ${query}

Instructions:
1. Provide a direct, detailed, and accurate answer based on the document content above.
2. If the user asks for a summary or what information is in the document, synthesize the key information, data, and sections.
3. Do not say "I don't know" if the document content above contains relevant facts or details that can answer the question.`;

        // 7. Generate final answer
        const answer = await generateTextResponse(prompt);

        // 8. Send response
        resp.json({
            answer,
            results: relevantResult
        });

    } catch (err) {
        console.log(err);

        resp.status(500).json({
            error: "RAG failed"
        });
    }
};




export const echat = async (req, resp) => {
    try {
        const { query } = req.body;

        // 1. Rewrite the original query
        const rewrittenQuery = await rewriteQuery(query);

        console.log("Original Query:", query);
        console.log("Rewritten Query:", rewrittenQuery);

        // 2. Expand the rewritten query
        const expandedQueries = await expandQuery(rewrittenQuery);

        console.log("Expanded Queries:", expandedQueries);

        // 3. Store results from all expanded queries
        const allResults = [];

        // 4. Search for every expanded query
        for (const searchQuery of expandedQueries) {

            const queryEmbedding = await generateEmbedding(searchQuery);

            const results = await Embedding.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "embedding",
                        queryVector: queryEmbedding,
                        numCandidates: 50,
                        limit: 5
                    }
                },
                {
                    $project: {
                        text: 1,
                        score: {
                            $meta: "vectorSearchScore"
                        }
                    }
                }
            ]);

            allResults.push(...results);
        }

        console.log("Total Results:", allResults.length);
        const uniqueResults=[
            ...new Map(allResults.map(result=>[result.text,result])).values()
        ]
        console.log("After Deduplication:", uniqueResults.length);
        console.log(uniqueResults)
        //this will retrieve the new result from the following and all the results will be unique
        // 5. Select top relevant results adaptively (avoid dropping all chunks if scores are ~0.45)
        let relevantResults = uniqueResults.filter(
            result => (result.score || 0) >= 0.35
        ).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5);

        if (relevantResults.length === 0 && uniqueResults.length > 0) {
            relevantResults = uniqueResults.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5);
        }

        // 6. If nothing was found at all
        if (relevantResults.length === 0) {
            return resp.json({
                answer: "No relevant content was found in the indexed database for this query.",
                results: []
            });
        }

        // 7. Create context
        const context = relevantResults
            .map(result => result.text)
            .filter(Boolean)
            .join("\n\n");

        // 8. Create helpful prompt
        const prompt = `You are an expert AI analysis assistant.
Answer the user's question clearly and helpfully using the provided context below.

Context:
${context}

User Question:
${query}

Instructions:
1. Provide a comprehensive, accurate answer synthesized from the context.
2. If the user asks for a summary or general info, explain the main points, numbers, and data present in the context.
3. Do not refuse to answer if the context contains relevant information.`;

        // 9. Generate answer
        const answer = await generateTextResponse(prompt);

        // 10. Send response
        resp.json({
            answer,
            results: relevantResults,
            rewrittenQuery,
            expandedQueries
        });

    } catch (err) {
        console.log(err);

        resp.status(500).json({
            error: "RAG failed"
        });
    }
};



export const dechat = async (req, resp) => {
    try {
        const { query } = req.body;
        const rewrittenQuery = await rewriteQuery(query);
        console.log("Rewritten Query:", rewrittenQuery);
        const expandedQueries = await expandQuery(rewrittenQuery);
        const allResults = [];
        for (const searchQuery of expandedQueries) {
            const queryEmbedding = await generateEmbedding(searchQuery);
            const results = await Embedding.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "embedding",
                        queryVector: queryEmbedding,
                        numCandidates: 50,
                        limit: 5
                    },
                }, {
                    $project: {
                        text: 1,
                        score: {
                            $meta: "vectorSearchScore"
                        }
                    }
                }
            ]);
            allResults.push(...results);
        }
        const uniqueResults = [
            ...new Map(allResults.map(res => [res.text, res])).values()
        ];
        const relevant = uniqueResults.filter(result => result.score >= 0.5).sort((a, b) => b.score - a.score);
        const context = relevant.map(result => result.text).join("\n");
        const prompt = `Hey AI, answer the query taking this context into account. Context: ${context}. Query: ${query}. Only answer on the basis of context.`;
        const ans = await generateTextResponse(prompt);
        return resp.json({
            ans,
            results: relevant
        });
    } catch (err) {
        console.error("dechat error:", err);
        return resp.status(500).json({ error: "dechat failed" });
    }
};

export const reciprocalRankFusion = (vectorResults, KeyWordResults, k = 60) => {
    const scores = new Map();
    const addResults = (results) => {
        if (!Array.isArray(results)) return;
        results.forEach((result, index) => {
            const rank = index + 1;
            const rrfScore = 1 / (k + rank);
            const currentScore = scores.get(result.text) || 0;
            scores.set(result.text, currentScore + rrfScore);
        });
    };
    addResults(vectorResults);
    addResults(KeyWordResults);
    return [...scores.entries()].map(([text, score]) => ({
        text,
        score
    })).sort((a, b) => b.score - a.score);
};

// Backwards-compatible alias for any legacy callers
export const reciprocalRankFusuion = reciprocalRankFusion;
export const HybridSearch = async (req, resp) => {
    try {

        const { query } = req.body;

        const queryEmbedding = await generateEmbedding(query);

        // Vector Search
        const vectorResults = await Embedding.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 50,
                    limit: 5
                }
            },
            {
                $project: {
                    text: 1,
                    score: {
                        $meta: "vectorSearchScore"
                    }
                }
            }
        ]);

        // Keyword Search
        const KeyWordResults = await Embedding.aggregate([
            {
                $search: {
                    index: "text_search_index",
                    text: {
                        query: query,
                        path: "text"
                    }
                }
            },
            {
                $project: {
                    text: 1,
                    score: {
                        $meta: "searchScore"
                    }
                }
            },
            {
                $limit: 5
            }
        ]);

        // RRF
        const fusedResults = reciprocalRankFusuion(
            vectorResults,
            KeyWordResults
        );

        return resp.json({
            vectorResults,
            KeyWordResults,
            fusedResults
        });

    } catch (err) {

        console.log(err);

        return resp.status(500).json({
            error: "Hybrid search failed"
        });
    }
};

export const functionCallController=async(req,resp)=>{
    try{
        const{query}=req.body
        const response=await functionCalling(query)
        console.log(response)
        resp.json({
            response
        })
    }catch(err){
        console.log(err)
        resp.status(500).json({
            error:"Function calling failed"
        })
    }
}
export const functionCallControllers=async(req,resp)=>{
    try{
        const{query}=req.body
        const response=await functionCalling(query)
        const functionCall=response.functionCalls?.[0]
        if(!functionCall){
            return resp.json({
                answer: response.text
            });
        }
              console.log("FUNCTION NAME:", functionCall.name);
        console.log("FUNCTION ARGS:", functionCall.args);
        let results;
        if(functionCall.name==="addNumbers"){
            results=addNumbers(functionCall.args.a,functionCall.args.b)
        }
        resp.json({
            function: functionCall.name,
            args: functionCall.args,
            results
        })
    }catch(err){
 console.log(err);

        resp.status(500).json({
            error: "Function calling failed"
        });
    }
}

export const weatherController=async(req,resp)=>{
    try{
        const{query}=req.body
        const response=await weatherTool(query)
        console.log("Response",response)
        const functionCall=response.functionCalls?.[0];
        if(!functionCall){
             return resp.json({
                answer: response.text
            });
        }
        console.log("FUNCTION NAME:", functionCall.name);
       
        let results;
        if(functionCall.name==="getWeather"){
            results=await getWeather(functionCall.args.city)
        }
        resp.json({
            function:functionCall.name,
            args:functionCall.args,
            results
        })
    }catch(err){
 console.log(err);

        resp.status(500).json({
            error: "Weather tool failed"
        });
    }
}
export const Answer = async (req, resp) => {
    const { query } = req.body;

    const response = await agent(query);

    const functionCalling = response.functionCalls?.[0];

    console.log("FUNCTION CALL:", functionCalling);

    if (!functionCalling) {
        return resp.json({
            answer: response.text
        });
    }

    const tool = tools[functionCalling.name];

    if (!tool) {
        throw new Error("Tool not found");
    }

    const result = await tool(
        ...Object.values(functionCalling.args)
    );

    return resp.json({
        function: functionCalling.name,
        args: functionCalling.args,
        result
    });
};


export const planningController=async(req,resp)=>{
    try{
    const{query}=req.body
    const plan=await createPlan(query)
    console.log("plan",plan)

    const result=await executePlan(plan)

    console.log(result)

    return resp.json({
        query,
        plan,
        result
    })
    }catch(err){
        console.log(err)
        return resp.status(500).json({
            error:"planning failed"
        })
    }
}

export const AgentkeThrough=async(req,resp)=>{
    try{
        const{query}=req.body
        const answer=await agentLoop(query)
        return resp.json({
            answer
        })
    }catch(err){
         console.log(err);

        return resp.status(500).json({
            error: "Agent loop failed"
        });
    }
}

export const analyzeImageController=async(req,resp)=>{
    try{
        const{imageBase64,question}=req.body
        const answer=await analyzeImage(imageBase64,question)
        return resp.json({
            answer
        })
    }catch(err){
        console.log(err)

        return resp.status(500).json({
            error: "Image analysis failed"
        });
    }
}

export const imageAns=async(req,resp)=>{
    try{
        const{imageBase64,question}=req.body

        const answer=await analyzeImageStructure(imageBase64,question)
        return resp.json({
            answer
        })
    }catch(err){
        console.log(err);

        return resp.status(500).json({
            error: "Structured image analysis failed"
        });
    }
}

export const analyzePDFController = async (req, resp) => {
    try {

        const { pdfBase64, question } = req.body;

        console.log("PDF BASE64:", pdfBase64 ? "RECEIVED" : "MISSING");
        console.log("QUESTION:", question);

        const answer = await analyzePDF(
            pdfBase64,
            question
        );

        return resp.json({
            answer
        });

    } catch (err) {
        console.log(err);

        return resp.status(500).json({
            error: "PDF analysis failed"
        });
    }
};

export const pdfStore=async(req,resp)=>{
    try{
        const{filePath}=req.body
        const result=await extractPdfText(filePath)
         return resp.json({
            message: "PDF processed successfully",
            result
        });
    }catch(err){
        console.log(err)

        return resp.status(500).json({
            error: "PDF processing failed"
        });
    }
}
export const pdfRagController = async (req, resp) => {
    try {
        const { query, filePath, source } = req.body;
        const target = source || filePath;
        const result = await pdfRag(query, target);
        if (typeof result === 'string') {
            return resp.json({
                answer: result,
                data: result,
                source: target
            });
        }
        return resp.json(result);
    } catch (err) {
        console.log(err);
        return resp.status(500).json({
            error: "PDF RAG failed"
        });
    }
};

export const uploadDocs = async (req, resp) => {
    try {
        if (!req.file) {
            return resp.status(400).json({
                message: "File is required"
            });
        }
        const documents = await processPdf(req.file.buffer, req.file.originalname);
        return resp.status(200).json({
            message: "PDF processed successfully",
            chunksCreated: documents.length,
            filename: req.file.originalname
        });
    } catch (err) {
        console.error(err);
        return resp.status(500).json({
            message: err.message
        });
    }
};

export const RAns = async (req, resp) => {
    try {
        const { query, source, filename, filePath } = req.body;
        if (!query) {
            return resp.status(400).json({
                message: "Query is required"
            });
        }
        const targetSource = source || filename || filePath;
        const data = await pdfRag(query, targetSource);
        if (typeof data === 'string') {
            return resp.status(200).json({
                answer: data,
                data: data,
                source: targetSource
            });
        }
        return resp.status(200).json(data);
    } catch (err) {
        console.error(err);
        return resp.status(500).json({
            message: err.message
        });
    }
};