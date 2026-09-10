import { ai } from "../config/ai.js";
import {z} from 'zod'

const taskSchema=z.object({
    title:z.string(),
    priority:z.enum(["low","medium","high"]),
    due: z.string().optional()
})



export const generateAIResponse=async(message)=>{
    const response=await ai.models.generateContent({
        model:'gemini-2.5-flash',
        contents:message,
        config:{
            systemInstruction:`you are helpful ai asistant. answer clearly and concisely\
            RETURN JSON  
            {title:"string",
            "priority":"low"|"medium"|"high"},"due":"string"  RETURN ONLY JSON`,

            responseMimeType:"application/json"

            
        }
    })
    const rawData=JSON.parse(response.text)
    const validateData=taskSchema.parse(rawData)
    return validateData
}

export const generateAIStream=async(message)=>{
    const stream=await ai.models.generateContentStream({
        model:"gemini-2.5-flash",
        contents:message,
        config:{
            systemInstruction:` You are a helpful AI assistant.
                Answer clearly and in detail.`
        }
    })
    return stream
}