import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import tf from '@tensorflow/tfjs-node';
e945e55 (Add embedding generation to upload.js, prevent duplicates in sock_embeddings.json)
import cosineSimilarity from '../../utils/cosineSimilarity';

const embeddingsFilePath = path.join(process.cwd(), 'data', 'sock_embeddings.json');
const pipelineScript = path.join(process.cwd(), 'lib/imageProcessing/sock_pipeline.py');
const embeddingOutput = path.join(process.cwd(), 'lib/imageProcessing/embeddings/query_embedding.json');

function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        let { embedding, imageUrl, threshold = 0.7 } = req.body;
        
        if (!embedding && !imageUrl) {
            return res.status(400).json({ error: 'Missing embedding or image URL' });
        }
        
        if (!embedding && imageUrl) {
            console.log('Generating embedding for query sock...');
            const command = `source \"${process.cwd()}/sockmatch-venv/bin/activate\" && python \"${pipelineScript}\" --input \"${imageUrl}\" --output \"${embeddingOutput}\"`;
            await execPromise(command);
            embedding = JSON.parse(fs.readFileSync(embeddingOutput, 'utf8')).embedding;
        }

        const data = fs.readFileSync(embeddingsFilePath, 'utf8');
        const storedEmbeddings = JSON.parse(data);

        const matches = storedEmbeddings.map(sock => {
            return {
                id: sock.id,
                imageUrl: sock.imageUrl,
                similarity: cosineSimilarity(embedding, sock.embedding)
            };
        }).filter(match => match.similarity >= threshold)
          .sort((a, b) => b.similarity - a.similarity);

        res.status(200).json({ matches: matches.slice(0, 3) });
    } catch (error) {
        console.error('Error processing match request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
