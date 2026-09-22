import { ProcessPdf, RagAnss } from "../services/document.service.js";

export const uploadDocs = async (req, resp) => {
    try {
        if (!req.file) {
            return resp.status(400).json({
                message: "File is required"
            });
        }
        const documents = await ProcessPdf(req.file.buffer, req.file.originalname);
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
        const { query } = req.body;
        if (!query) {
            return resp.status(400).json({
                message: "Query is required"
            });
        }
        const data = await RagAnss(query);
        if (typeof data === 'string') {
            return resp.status(200).json({
                answer: data,
                data: data
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

export default {
    uploadDocs,
    RAns
};
