import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'pdf-uploader-middleware',
      configureServer(server) {
        server.middlewares.use('/api/upload-pdf', (req, res) => {
          if (req.method === 'POST') {
            const chunks = [];
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', async () => {
              try {
                const raw = Buffer.concat(chunks).toString('utf-8');
                const body = JSON.parse(raw);
                const { filename, base64 } = body;
                
                const safeFilename = (filename || 'uploaded.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
                const uploadsDir = path.resolve(__dirname, '../ai-express/uploads');
                if (!fs.existsSync(uploadsDir)) {
                  fs.mkdirSync(uploadsDir, { recursive: true });
                }
                const targetPath = path.join(uploadsDir, safeFilename);
                const fileBuffer = Buffer.from(base64, 'base64');
                fs.writeFileSync(targetPath, fileBuffer);
                
                const relativeFilePath = `uploads/${safeFilename}`;
                
                // Call backend storepdfthings to extract, chunk and save embeddings in MongoDB
                const backendRes = await fetch('http://localhost:3000/api/v1/storepdfthings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ filePath: relativeFilePath })
                });
                
                const data = await backendRes.json();
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: true,
                  filePath: relativeFilePath,
                  filename: safeFilename,
                  backendResult: data
                }));
              } catch (err) {
                console.error('Upload error in middleware:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else {
            res.writeHead(405);
            res.end();
          }
        });
      }
    }
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
