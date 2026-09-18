import { properties } from "zod"
import { ai } from "../config/ai.js"
import Embedding from "../models/embedding.models.js"
import { addNumbers, agent, agentLoop, createPlan, executePlan, expandQuery,functionCalling, generateAi, generateAIResponse, generateAIStream, generateEmbedding, generateTextResponse, getWeather, rewriteQuery, tools, weatherTool } from "../services/ai.services.js"
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

export const answer=async(req,resp)=>{
    try{
    const{message}=req.body
    const reply=await generateAi(message)
    const ans=reply.text
    resp.json(ans)
    }catch(err){
        console.log(err)
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
    const chunks=chunkTextByWords(text,5,2)
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

export const SearchSimilarChunks=async(req,resp)=>{
    try{
        const{query}=req.body;

        // const queryEmbedding=await generateEmbedding(query)

        const results=await Embedding.aggregate([
            {
                // $vectorSearch: {
                //     index: "vector_index",
                //     path: "embedding",
                //     queryVector:queryEmbedding,
                //     numCandidates: 50,
                //     limit: 5
                // }
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


export const ragChat = async (req, resp) => {
    try {
        const { query } = req.body;
        const rewrittenQuery=await rewriteQuery(query);
        console.log("Original Query:", query);
console.log("Rewritten Query:", rewrittenQuery);
        const queryEmbedding = await generateEmbedding(rewrittenQuery);

        // 2. Search similar chunks
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

        // 3. Keep only relevant chunks
        const relevantResult = results.filter(
            result => result.score >= 0.5
        );


        // 5. Create context from relevant chunks
        const context = relevantResult
            .map(result => result.text)
            .join("\n");

        // 6. Create prompt for LLM
        const prompt = `
            You are answering a question from a database.

Here is the database information:

${context}

Question:
${query}

Answer the question using the database information above.

Do not say you don't know if the information is present above.
        `;

        // 7. Generate final answer
        const answer = await generateTextResponse(prompt);

        // 8. Send response
        resp.json({
            answer,
            results
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
        // 5. Remove low-score results
        const relevantResults = uniqueResults.filter(
            result => result.score >= 0.5
        ).sort((a,b)=>b.score-a.score).slice(0,5)

        // 6. If nothing relevant was found
        if (uniqueResults.length === 0) {
            return resp.json({
                answer: "I don't know based on the available context.",
                results: uniqueResults
            });
        }

        // 7. Create context
        const context = relevantResults
            .map(result => result.text)
            .join("\n");

        // 8. Create final prompt
        const prompt = `
            Answer the user's question using the provided context.

            Context:
            ${context}

            User Question:
            ${query}

            If the answer is not present in the context,
            say you do not know.
        `;

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



export const dechat=async(req,resp)=>{
    try{
        const{query}=req.body
        const rewrittenQuery=await rewriteQuery(query)
        console.log(rewrittenQuery)
        const allResults=[]
        for(const searchQuery of expandQuery){
            const queryEmbedding=await queryEmbedding(searchQuery)
            const results=Embedding.aggregate([
                {
                    $vectorSearch:{
                        index:"vector_index",
                        path:"embedding",
                        queryVector:queryEmbedding,
                        numCandidates:50,
                        limit:5
                    },
                },{
                    $project:{
                        text:1,
                        score:{
                            $meta:vectorSearchScore
                        }
                    }
                }
            ])
            allResults.push(...results)

        }
        console.log(allResults.length)
        const uniqueResults=[
            ...new Map(allResults.map(results=>[results.text,results])).values()
        ]
        const Relevent=uniqueResults.filter(result=>result.score>=0.5).sort((a,b)=>b.score-a.score)
        const context=Relevent.map(result=>result.text).join("\n")
        const prompt=`heyy ai answer it by taking context context is ${context} ans you have to answer the query and query is ${query} Only answer on the basis of context `
        const ans=await generateTextResponse(prompt)
        resp.json({
            ans
        })


        
    }catch(err){
        console.log(err)
    }
}

export const searchByChunks=async(req,resp)=>{
    const{query}=req.body
    const queryEmbedding=await generateEmbedding(query)
    const vectorResults=await Embedding.aggregate([
        {
            $vectorSearch:{
                index:"vector_index",
                path:"embedding",
                queryVector:queryEmbedding,
                numCandidates:50,
                limit:5
            }
        },
        {
            $project:{
                text:1,
                score:{
                    $meta:"vectorSearchScore"
                }
            }
        }
    ]);
    const KeyWordResults=await Embedding.aggregate([
        {
            $search:{
                index:"text_search_index",
                text:{
                    query:query,
                    path:"text"
                }
            }
        },{
            $project:{
                text:1,
                score:{
                    $meta:"searchScore"
                }
            }
        },{
            $limit: 5
        }
    ])
    resp.json({
            vectorResults,
            KeyWordResults
        })
}

export const reciprocalRankFusuion=(vectorResults,KeyWordResults,k=60)=>{
    const scores=new Map();
    const addResults=(results)=>{
        results.forEach((result,index)=>{
            const rank=index+1;
            const rrfScore=1/(k+rank)
            const currentScore=scores.get(result.text)||0
            scores.set(result.text,currentScore+rrfScore)
        })
    }
    addResults(vectorResults)
    addResults(KeyWordResults)
    return [...scores.entries()].map(([text, score]) => ({
    text,
    score
})).sort((a,b)=>b.score-a.score)
}

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
        const response=weatherTool(query)
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
        return resp.json({
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