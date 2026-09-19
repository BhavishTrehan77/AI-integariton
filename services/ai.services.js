import { ai } from "../config/ai.js";
import {properties, z} from 'zod'
import { chunkTextByWords } from "../utils/chunkText.js";
import fs from "fs";
import { PDFParse } from "pdf-parse";
import Embedding from "../models/embedding.models.js";
import { parse } from "path";

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


export const addNumbers=(a,b)=>{
    return a+b
}

export const functionCalling=async(message)=>{
    const response=await ai.models.generateContent({
        model:"gemini-3.6-flash",
        contents:message,

        config:{
            tools: [
                {
                    functionDeclarations:[
                        {
                            name:"addNumbers",
                            description: "Add two numbers togeather",
                            parameters:{
                                type:"OBJECT",
                                properties:{
                                a:{
                                    type:"NUMBER",
                                    description: "First number"
                                },
                                b:{
                                    type:"NUMBER",
                                    description: "Second number"
                                }
                            },
                             required: ["a","b"]
                            }
                           
                        }
                    ]
                }
            ]
        }
    })
    return response
}

// export const getWeather=async(city)=>{
//     const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`)
//     const data=await response.json()

//     return{
//         city:data.name,
//         temperature: data.main.temp,
//         condition: data.weather[0].description
//     }
// }
export const getWeather = async (city) => {

    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );

    const data = await response.json();

    console.log("WEATHER STATUS:", response.status);
    console.log("WEATHER DATA:", data);

    if (!response.ok) {
            throw new Error(data.message || "Weather API failed");
    }

    return {
        city: data.name,
        temperature: data.main.temp,
        condition: data.weather[0].description
    };
};

export const weatherTool=async(message)=>{
   const response=await ai.models.generateContent({
    model:"gemini-3.6-flash",
    contents:message,
    config:{
        tools:[
            {
                functionDeclarations:[
                    {
                        name:"getWeather",
                        description:"Get current weather information for a city",
                        parameters: {
                            type:"OBJECT",
                            properties:{
                                city:{
                                    type:"STRING",
                                    description:"Name of the city"
                                }
                            },
                            required: ["city"]
                        }
                        

                    }
                ]
            }
        ]
    }
   })
   return response
}

export const tools = {
    addNumbers,
    getWeather
};

export const agent = async (query) => {
    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: query,

        config: {
            tools: [
                {
                    functionDeclarations: [
                        {
                            name: "addNumbers",
                            description: "Add two numbers",

                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    a: {
                                        type: "NUMBER"
                                    },
                                    b: {
                                        type: "NUMBER"
                                    }
                                },
                                required: ["a", "b"]
                            }
                        },

                        {
                            name: "getWeather",
                            description: "Get current weather information for a city",

                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    city: {
                                        type: "STRING"
                                    }
                                },
                                required: ["city"]
                            }
                        }
                    ]
                }
            ]
        }
    });

    return response;
};
export const createPlan = async (query) => {

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",

        contents: `
You are AI planning agent.

Break the users request into executable steps.

Available tools:
1. getWeather(city)
2. addNumbers(a,b)

Return only valid JSON.

Format:
[
    {
        "tool": "getWeather",
        "args": {
            "city": "rohtak"
        }
    },
    {
        "tool": "addNumbers",
        "args": {
            "a": 25,
            "b": 35
        }
    }
]

Rules:
- Each step must contain a tool.
- Each step must contain args.
- Do not execute the tools.
- Do not answer the user.

User request:
${query}
        `
    });

    return JSON.parse(response.text);
};

export const executePlan=async(plan)=>{
    const results=[];
    for(const step of plan){
        const tool=tools[step.tool]
         if (!tool) {
            throw new Error(`Tool not found: ${step.tool}`);
        }
        const result=await tool(...Object.values(step.args))
        results.push({
            tool:step.tool,
            args:step.args,
            result
        })
    }
    return results;
}

export const agentLoop=async(query)=>{
    const message=[
        {
            role: "user",
            parts: [
                {
                    text: query
                }
            ]
        }
    ];
    while(true){
        const response=await ai.models.generateContent({
            model:"gemini-3.5-flash",
            contents:message,
            config:{
                tools:[
                    {
                    name:"addNumbers",
                    description:"add two nos",

                    parameters: {
                        type:"OBJECT",

                        parameters:{
                            a:{
                                type:"NUMBER"
                            },
                            b:{
                                type:"NUMBER"
                            }
                        },
                        required: ["a","b"]
                    }
                    },
                    {
                        name: "getWeather",
                        description: "get current weather information for a city",

                        parameters:{
                            type:"OBJECT",
                            parameters:{
                                city:{
                                    type:"STRING"
                                }
                            },
                            required: ["city"]
                        }
                    }
                    
                    
                ]
            }
        })
        const functionCalling=response.functionCalls?.[0]  
            console.log("FUNCTION CALL:", functionCalling);

        // No tool call = final answer
        if (!functionCalling) {
            return response.text;
        }
        const tool=tools[functionCalling.args]

        const result=await tool(...Object.values(functionCalling.args))

        message.push(response.candidates[0].content)

        message.push({
            role: "user",
            parts: [
                {
                    functionResponse: {
                        name: functionCalling.name,
                        response: {
                            result
                        }
                    }
                }
            ]
        })
        }

}
export const analyzeImage=async(imageBase64,question)=>{
    const response=await ai.models.generateContent({
        model:"gemini-3.6-flash",
        contents: [
            {
                inlineData:{
                    mimeType: "image/jpeg",
                    data: imageBase64
                }
            },
            {
                text:question
            }
        ]
    })
    return response.text
}

export const analyzeImageStructure=async(imageBase64,question)=>{
    const response=await ai.models.generateContent({
        model:"gemini-3.6-flash",
        contents:[
            {
                inlineData:{
                    mimeType:"image/jpeg",
                    data:imageBase64
                }
            },
            {
            text:`Analyze the image and answer the question ${question}.

Question:
${question}`
            }
        ],
        config:{
            responseMimeType:"application/json"
        }
    })
    return JSON.parse(response.text)
}

export const analyzePDF =async(pdfBase64,question)=>{
    const response=await ai.models.generateContent({
        model:"gemini-3.6-flash",
        contents:[
            {
                inlineData: {
                    mimeType: "application/pdf",
                    data: pdfBase64
                }
               
            },
            {
                text:question
            }
        ]
    })
    return response.text
}

export const extractPdfText=async(filePath)=>{
    const dataBuffer=fs.readFileSync(filePath)

    const parser=new PDFParse({
        data:dataBuffer
    })
    const data=await parser.getText();

    await parser.destroy(); 

    const text=data.text;

    const chunks=chunkTextByWords(text,100,20)

   const results=[]
   for (const chunk of chunks){
    const embedding=await generateEmbedding(chunk);

    const result=await Embedding.create({
        text:chunk,
        embedding:embedding,
        source: filePath
    })
    results.push(result)
   } 
   return results
}

export const pdfRag=async(query,filePath)=>{
    const queryEmbedding=await generateEmbedding(query)

    const results=await Embedding.aggregate([
        {
            $vectorSearch:{
                index:"vector_index",
                path:"embedding",
                queryVector:queryEmbedding,
                numCandidates:50,
                limit:5,
                filter:{
                    source:filePath
                }
            }
        }
    ])
    const context=results.map(result=>result.text).join("\n")
    const response=await ai.models.generateContent({
        model:"gemini-3.5-flash",
        contents:`Answer the users question only the basis of provided context .
        PDF context is ${context} and user question is ${query}If the answer is not present in the PDF context,
say "I don't know based on the provided PDF."
`
    })
    return response.text
}



