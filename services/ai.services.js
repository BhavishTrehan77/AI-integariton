import { ai } from "../config/ai.js";
import {z} from 'zod'
import { chunkTextByWords } from "../utils/chunkText.js";

const taskSchema=z.object({
    title:z.string(),
    priority:z.enum(["low","medium","high"]),
    due: z.string().optional()
})

export const generateAi=async(message)=>{
    const response=await ai.models.generateContent({
        model:"gemini-3.5-flash-lite",
        contents:message,
        config:{
            systemInstruction:`ai should answer the question concisely and give correct answer`
        }
    })
    return response

}

export const generateAIResponse=async(message)=>{
    const response=await ai.models.generateContent({
        model:"gemini-3.5-flash-lite",
        contents:message,
        config:{
            systemInstruction:` You are a helpful task assistant.

                Convert the user's request into a task object.

                Return ONLY valid JSON in this format:
                {
                    "title": "string",
                    "priority": "low",
                    "due": "string"
                }

                Priority must be one of:
                "low", "medium", "high"

                The title should describe the user's requested task.
                Do not return the user's question as the entire response.
                Extract the task information from it.`,

            responseMimeType:"application/json"

            
        }
    })
    const rawData=JSON.parse(response.text)
    const validateData=taskSchema.parse(rawData)
    return validateData
}

export const generateAIStream=async(message)=>{
    const stream=await ai.models.generateContentStream({
        model:'gemini-3.6-flash',
        contents:message,
        config:{
            systemInstruction:` You are a helpful AI assistant.
                Answer clearly and in detail.`
        }
    })
    return stream
}

export const generateEmbedding = async (text) => {

    console.log("EMBED TEXT:", text);
    console.log("EMBED TYPE:", typeof text);

    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: text
    });

    return response.embeddings[0].values;
};

// export const generateTextResponse=async(prompt)=>{
//     const response=await ai.models.generateContent({
//         model: "gemini-2.5-flash",
//         contents:prompt
//     })
//     return response.text
// }
export const generateTextResponse = async (prompt) => {

    console.log("🔥 generateTextResponse CALLED");
    console.log("🔥 MODEL = gemini-2.5-flash");

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt
    })

    return response.text
}


export const rewriteQuery=async(query)=>{
    const response=await ai.models.generateContent({
        model:"gemini-3.5-flash-lite",
        contents:`Rewrite the users query into clear and specific search query .Return only the rewritten query. Do not answer the question. User Query ${query}`
    })
    return response.text.trim();
}


export const expandQuery=async(query)=>{
    const response=await ai.models.generateContent({
        model:"gemini-3.1-flash-lite",
        contents:`Generate 3 different search queries that could help retrieve documents relevant to the user questions. return only 3 queries one per line. Do not answer the question User quesion ${query}`
    })
    return response.text.trim()
        .split("\n")
        .map(q => q.replace(/^\d+[\).\s-]*/, "").trim())
        .filter(Boolean);
}
