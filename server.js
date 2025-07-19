import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from "@google/genai";
import { LocalIndex } from 'vectra';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import LlmManager from './llm_rotation.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect if running in packaged Electron app
const isPackaged = process.env.ELECTRON_IS_PACKAGED === '1';

// Get the correct base path for data storage
function getDataPath() {
    if (isPackaged) {
        // In packaged app, use userData directory for writable data
        return path.join(os.homedir(), 'ChunRAG');
    }
    return __dirname;
}

// Get the correct path for static resources
function getResourcePath() {
    if (isPackaged) {
        // In packaged app, we're already in the app directory, so use current directory
        return __dirname;
    }
    return __dirname;
}

console.log('ChunRAG Server Starting...');
console.log('Is packaged:', isPackaged);
console.log('Current directory:', __dirname);
console.log('Data path:', getDataPath());
console.log('Resource path:', getResourcePath());

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(getResourcePath(), 'public')));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(getDataPath(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Initialize LLM Manager
const llmManager = new LlmManager();

// Initialize vector database
const indexPath = path.join(getDataPath(), 'vector_index');
const index = new LocalIndex(indexPath);

// Store for documents and API keys
let documents = [];
let apiKeys = {};
let modelParameters = {
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    topK: 40,
    frequencyPenalty: 0,
    presencePenalty: 0
};

// File paths for persistence
const dataDir = path.join(getDataPath(), 'data');
const documentsFile = path.join(dataDir, 'documents.json');
const apiKeysFile = path.join(dataDir, 'apiKeys.json');
const modelParametersFile = path.join(dataDir, 'modelParameters.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Load data from files
function loadData() {
    try {
        if (fs.existsSync(documentsFile)) {
            documents = JSON.parse(fs.readFileSync(documentsFile, 'utf8'));
        }
        if (fs.existsSync(apiKeysFile)) {
            apiKeys = JSON.parse(fs.readFileSync(apiKeysFile, 'utf8'));
        }
        if (fs.existsSync(modelParametersFile)) {
            modelParameters = JSON.parse(fs.readFileSync(modelParametersFile, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Save data to files
function saveDocuments() {
    try {
        fs.writeFileSync(documentsFile, JSON.stringify(documents, null, 2));
    } catch (error) {
        console.error('Error saving documents:', error);
    }
}

function saveApiKeys() {
    try {
        fs.writeFileSync(apiKeysFile, JSON.stringify(apiKeys, null, 2));
    } catch (error) {
        console.error('Error saving API keys:', error);
    }
}

function saveModelParameters() {
    try {
        fs.writeFileSync(modelParametersFile, JSON.stringify(modelParameters, null, 2));
    } catch (error) {
        console.error('Error saving model parameters:', error);
    }
}

// Initialize vector database
async function initializeVectorDB() {
    if (!(await index.isIndexCreated())) {
        await index.createIndex();
    }
}

// Generate embeddings using Gemini
async function generateEmbeddings(text) {
    if (!apiKeys.gemini || apiKeys.gemini.length === 0) {
        throw new Error('Gemini API key required for embeddings');
    }
    
    const ai = new GoogleGenAI({ apiKey: apiKeys.gemini[0] });
    
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: [text]
    });
    
    return response.embeddings[0].values;
}

// Extract text from different file types
async function extractTextFromFile(filePath, originalName) {
    const ext = path.extname(originalName).toLowerCase();
    
    try {
        switch (ext) {
            case '.txt':
            case '.md':
            case '.csv':
                return fs.readFileSync(filePath, 'utf8');
            
            case '.pdf':
                const pdfBuffer = fs.readFileSync(filePath);
                const pdfData = await pdfParse(pdfBuffer);
                return pdfData.text;
            
            case '.docx':
                const docxBuffer = fs.readFileSync(filePath);
                const docxResult = await mammoth.extractRawText({ buffer: docxBuffer });
                return docxResult.value;
            
            default:
                throw new Error(`Unsupported file type: ${ext}`);
        }
    } catch (error) {
        console.error(`Error extracting text from ${originalName}:`, error);
        throw new Error(`Failed to extract text from ${originalName}: ${error.message}`);
    }
}

// Routes

// Get model configurations
app.get('/api/models', (req, res) => {
    res.json(LlmManager.modelConfigurations);
});

// Set API keys
app.post('/api/keys', (req, res) => {
    try {
        apiKeys = { ...apiKeys, ...req.body };
        saveApiKeys();
        res.json({ success: true, message: 'API keys updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get API keys (without exposing actual keys)
app.get('/api/keys', (req, res) => {
    const keyStatus = {};
    for (const [provider, keys] of Object.entries(apiKeys)) {
        keyStatus[provider] = Array.isArray(keys) ? keys.length : (keys ? 1 : 0);
    }
    res.json(keyStatus);
});

// Clear API key for specific provider
app.delete('/api/keys/:provider', (req, res) => {
    try {
        const provider = req.params.provider;
        if (apiKeys[provider]) {
            delete apiKeys[provider];
            saveApiKeys();
            res.json({ success: true, message: `API key for ${provider} cleared successfully` });
        } else {
            res.status(404).json({ success: false, error: `No API key found for provider: ${provider}` });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Clear all API keys
app.delete('/api/keys', (req, res) => {
    try {
        apiKeys = {};
        saveApiKeys();
        res.json({ success: true, message: 'All API keys cleared successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Test API key connection for specific provider
app.post('/api/keys/test/:provider', async (req, res) => {
    try {
        const provider = req.params.provider;
        const apiKey = req.body.apiKey;
        
        if (!apiKey) {
            return res.status(400).json({ success: false, error: 'API key is required' });
        }

        // Simple test - we'll just check if the key is properly formatted
        // In a real implementation, you'd make an actual API call to test the key
        let isValid = false;
        let message = '';

        switch (provider) {
            case 'openai':
                isValid = apiKey.startsWith('sk-') && apiKey.length > 20;
                message = isValid ? 'OpenAI API key format is valid' : 'Invalid OpenAI API key format';
                break;
            case 'anthropic':
                isValid = apiKey.startsWith('sk-ant-') && apiKey.length > 20;
                message = isValid ? 'Anthropic API key format is valid' : 'Invalid Anthropic API key format';
                break;
            case 'google':
                isValid = apiKey.length > 10; // Basic length check
                message = isValid ? 'Google API key format is valid' : 'Invalid Google API key format';
                break;
            default:
                isValid = apiKey.length > 10; // Basic validation
                message = isValid ? 'API key format appears valid' : 'Invalid API key format';
        }

        res.json({ success: isValid, message, valid: isValid });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get model parameters
app.get('/api/parameters', (req, res) => {
    res.json(modelParameters);
});

// Set model parameters
app.post('/api/parameters', (req, res) => {
    try {
        modelParameters = { ...modelParameters, ...req.body };
        saveModelParameters();
        res.json({ success: true, message: 'Model parameters updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload and process document
app.post('/api/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;
        
        // Extract text from file
        const content = await extractTextFromFile(filePath, fileName);
        
        // Split content into chunks (simple chunking)
        const chunks = chunkText(content, 1000);
        
        // Generate embeddings and store in vector database
        const docId = Date.now().toString();
        for (let i = 0; i < chunks.length; i++) {
            const embedding = await generateEmbeddings(chunks[i]);
            await index.insertItem({
                vector: embedding,
                metadata: { 
                    text: chunks[i],
                    docId: docId,
                    fileName: fileName,
                    chunkIndex: i
                }
            });
        }

        // Store document info
        const document = {
            id: docId,
            name: fileName,
            path: filePath,
            uploadDate: new Date().toISOString(),
            chunks: chunks.length
        };
        
        documents.push(document);
        saveDocuments();
        
        res.json({ success: true, document: document });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get documents
app.get('/api/documents', (req, res) => {
    res.json(documents);
});

// Cleanup orphaned files endpoint
app.post('/api/cleanup', (req, res) => {
    try {
        cleanupOrphanedFiles();
        res.json({ success: true, message: 'Cleanup completed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete document
app.delete('/api/documents/:id', async (req, res) => {
    try {
        const docId = req.params.id;
        
        // Find the document to get its file path
        const documentToDelete = documents.find(doc => doc.id === docId);
        if (!documentToDelete) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }
        
        // Remove from documents array
        documents = documents.filter(doc => doc.id !== docId);
        saveDocuments();
        
        // Delete the physical file
        try {
            if (fs.existsSync(documentToDelete.path)) {
                fs.unlinkSync(documentToDelete.path);
                console.log(`Deleted file: ${documentToDelete.path}`);
            }
        } catch (fileError) {
            console.error(`Error deleting file ${documentToDelete.path}:`, fileError);
            // Continue with the process even if file deletion fails
        }
        
        // Remove from vector database (recreate index for simplicity)
        await index.deleteIndex();
        await index.createIndex();
        
        // Re-add remaining documents
        for (const doc of documents) {
            try {
                if (fs.existsSync(doc.path)) {
                    const content = await extractTextFromFile(doc.path, doc.name);
                    const chunks = chunkText(content, 1000);
                    
                    for (let i = 0; i < chunks.length; i++) {
                        const embedding = await generateEmbeddings(chunks[i]);
                        await index.insertItem({
                            vector: embedding,
                            metadata: { 
                                text: chunks[i],
                                docId: doc.id,
                                fileName: doc.name,
                                chunkIndex: i
                            }
                        });
                    }
                } else {
                    console.warn(`Document file not found: ${doc.path}, removing from database`);
                    documents = documents.filter(d => d.id !== doc.id);
                    saveDocuments();
                }
            } catch (docError) {
                console.error(`Error re-adding document ${doc.name}:`, docError);
            }
        }
        
        res.json({ success: true, message: 'Document and file deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, provider, model, systemPrompt } = req.body;
        
        // Use stored model parameters, but allow override from request
        const temperature = req.body.temperature ?? modelParameters.temperature;
        const topP = req.body.topP ?? modelParameters.topP;
        const maxTokens = req.body.maxTokens ?? modelParameters.maxTokens;
        
        let context = '';
        
        // If documents are available, search for relevant context
        if (documents.length > 0) {
            const queryEmbedding = await generateEmbeddings(message);
            const results = await index.queryItems(queryEmbedding, 3);
            
            if (results.length > 0) {
                context = results.map(result => result.item.metadata.text).join('\n\n');
            }
        }
        
        // Prepare messages
        const messages = [];
        
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        
        if (context) {
            messages.push({ 
                role: 'system', 
                content: `Context from uploaded documents:\n\n${context}\n\nPlease use this context to answer the user's question when relevant.` 
            });
        }
        
        messages.push({ role: 'user', content: message });
        
        // Generate response
        const settings = {
            provider: provider,
            model: model,
            apiKeys: apiKeys,
            temperature: temperature,
            topP: topP,
            maxTokens: maxTokens,
            siteUrl: 'http://localhost:3000',
            siteName: 'ChunRAG'
        };
        
        const response = await llmManager.generateResponse(messages, settings);
        
        res.json({ 
            success: true, 
            response: response,
            contextUsed: context ? true : false
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper function to chunk text
function chunkText(text, maxLength) {
    const chunks = [];
    const sentences = text.split(/[.!?]+/);
    let currentChunk = '';
    
    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxLength) {
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = sentence;
        } else {
            currentChunk += sentence + '.';
        }
    }
    
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    loadData();
    initializeVectorDB();
});
