#!/usr/bin/env node

// Build cleanup script to ensure proper packaging
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running pre-build cleanup...');

// Ensure all required directories exist in the source
const requiredDirs = ['data', 'uploads', 'vector_index', 'test', 'public'];

requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        console.log(`Creating missing directory: ${dir}`);
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// Create placeholder files to ensure directories are included
const placeholderContent = '# This file ensures the directory is included in the build\n';

requiredDirs.forEach(dir => {
    const placeholderPath = path.join(__dirname, dir, '.gitkeep');
    if (!fs.existsSync(placeholderPath)) {
        console.log(`Creating placeholder file in: ${dir}`);
        fs.writeFileSync(placeholderPath, placeholderContent);
    }
});

// Check for test directory specifically
const testDataDir = path.join(__dirname, 'test', 'data');
if (!fs.existsSync(testDataDir)) {
    console.log('Creating test/data directory...');
    fs.mkdirSync(testDataDir, { recursive: true });
    fs.writeFileSync(path.join(testDataDir, '.gitkeep'), placeholderContent);
}

console.log('Pre-build cleanup completed!');
