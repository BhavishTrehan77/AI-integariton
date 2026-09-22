import { PDFParse } from "pdf-parse";
import { chunkTextByWords } from "../utils/ai.utils.js";
import { GenerateEmbedding, GeneratePromptResponse } from "./ai.services.js";
import Embed from "../models/ai.models.js";

export const ProcessPdf = async (fileBuffer, originalName = "uploaded.pdf") => {
    const parser = new PDFParse({ data: fileBuffer });
    const data = await parser.getText();
    if (typeof parser.destroy === 'function') {
        await parser.destroy();
    }
    const text = data.text;
    const chunks = await chunkTextByWords(text, 300, 50);
    console.log("CHUNKS VALUE:", chunks);
    console.log("CHUNKS TYPE:", typeof chunks);
    console.log("IS ARRAY:", Array.isArray(chunks));
    const results = [];
    for (const chunk of chunks) {
        const embedding = await GenerateEmbedding(chunk);
        const document = await Embed.create({
            text: chunk,
            embedding: embedding,
            source: originalName
        });
        results.push(document);
    }
    return results;
};

export const RagAnss = async (query) => {
    const queryEmbedding = await GenerateEmbedding(query);
    const result = await Embed.aggregate([
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
    const context = result.map(res => res.text).join("\n");
    const prompt = `
Answer the user's question using ONLY the provided context.

If the answer is not present in the context,
say that you don't know based on the uploaded document.

Context:
${context}

Question:
${query}
`;
    const response = await GeneratePromptResponse(prompt);
    return response;
};

export default {
    ProcessPdf,
    RagAnss
};
