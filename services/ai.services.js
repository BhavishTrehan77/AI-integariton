import { ai } from "../config/ai.js";
import {z} from 'zod'
import { chunkTextByWords } from "../utils/chunkText.js";

const taskSchema=z.object({
    title:z.string(),
    priority:z.enum(["low","medium","high"]),
    due: z.string().optional()
})



export const generateAIResponse=async(message)=>{
    const response=await ai.models.generateContent({
        model:'gemini-3.6-flash',
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
        model:'gemini-3.6-flash',
        contents:message,
        config:{
            systemInstruction:` You are a helpful AI assistant.
                Answer clearly and in detail.`
        }
    })
    return stream
}

export const generateEmbedding=async(text)=>{
    const response=await ai.models.embedContent({
        model:'gemini-embedding-001',
        contents:text
    })
    return response.embeddings[0].values
}



// // my work is to 1st connect the api and get the reponse for the query simple response

// // // so firstly export const async function getresponse(message)=>{
// // const reply=await ai.models.generateContent({
// //     model:"gemini-3.6-flash",
// //     contents:message
// // })
// // } move this whole code itno try catch and it is done and in vontroller just take maess from req.bpody and make trout for positng and oyu are done

// now second part we have to add valiodation to the data that data should be returned in json format
// what we will do is firstly make a zod validation on top

// const validatio=z.object({
//     title:"string",
// })

// then make a functionn 

// export const async function generatevalidatedcontent(messaeg)=>{
//     const reply=await ai.models.generateContent({
//         model:"gemini-3.6-flash",
//         contents:message,
//         systemInstruction:`this is to be told and information for the model that return output should be in json format it shpould be like this {"title":"string"}
//         return it in json`
//     })
//     const validation=JSON.parse(reply)
//     const rawData=validatio.parse(validation)
//     return rawData
// }






