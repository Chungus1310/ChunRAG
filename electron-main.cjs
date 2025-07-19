const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

let mainWindow;
let serverProcess;

// Check if running in development or packaged
function isDev() {
    return !app.isPackaged;
}

// Get the correct resource path for packaged app
function getResourcePath() {
    if (isDev()) {
        return __dirname;
    }
    return process.resourcesPath;
}

// Get the correct app path
function getAppPath() {
    if (isDev()) {
        return __dirname;
    }
    // In packaged app, when asar is disabled, files are directly in resources/app
    return path.join(process.resourcesPath, 'app');
}

// Start the Express server as a separate process
function startServer() {
    return new Promise((resolve, reject) => {
        console.log('Starting server process...');
        
        const appPath = getAppPath();
        const serverPath = path.join(appPath, 'server.js');
        const workingDir = isDev() ? __dirname : appPath;
        
        console.log('Server path:', serverPath);
        console.log('Working directory:', workingDir);
        console.log('Is development:', isDev());
        console.log('App is packaged:', app.isPackaged);
        
        // Check if server.js exists
        if (!fs.existsSync(serverPath)) {
            const error = new Error(`Server file not found at: ${serverPath}`);
            console.error(error.message);
            reject(error);
            return;
        }
        
        serverProcess = spawn('node', [serverPath], {
            cwd: workingDir,
            stdio: isDev() ? 'inherit' : 'pipe',
            env: { 
                ...process.env, 
                NODE_ENV: isDev() ? 'development' : 'production',
                ELECTRON_IS_PACKAGED: app.isPackaged ? '1' : '0'
            }
        });
        
        serverProcess.on('error', (err) => {
            console.error('Server process error:', err);
            reject(err);
        });
        
        serverProcess.on('exit', (code, signal) => {
            console.log(`Server process exited with code ${code} and signal ${signal}`);
            if (code !== 0 && code !== null) {
                reject(new Error(`Server process exited with code ${code}`));
            }
        });
        
        if (!isDev()) {
            let output = '';
            serverProcess.stdout?.on('data', (data) => {
                const text = data.toString();
                output += text;
                console.log('Server output:', text);
                // Look for server ready message
                if (text.includes('Server running at http://localhost:3000') || 
                    text.includes('listening on port 3000')) {
                    resolve();
                }
            });
            
            serverProcess.stderr?.on('data', (data) => {
                const text = data.toString();
                console.error('Server error:', text);
                // Don't reject on stderr as some modules log to stderr normally
            });
            
            // Fallback timeout for packaged app
            setTimeout(() => {
                console.log('Server startup timeout reached, checking if server is responsive...');
                resolve(); // Let waitForServer handle the actual check
            }, 8000);
        } else {
            // In development, give a shorter timeout
            setTimeout(() => {
                console.log('Development server should be running');
                resolve();
            }, 3000);
        }
    });
}

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: false, // Allow loading local resources
            preload: path.join(isDev() ? __dirname : getAppPath(), 'preload.cjs')
        },
        show: false, // Don't show until ready
        titleBarStyle: 'default',
        autoHideMenuBar: true
    });

    // Load the app
    console.log('Loading URL: http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000');
    
    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        console.log('Window ready to show');
        mainWindow.show();
        
        if (isDev()) {
            mainWindow.webContents.openDevTools();
        }
    });
    
    // Add error handling for failed loads
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('Failed to load:', errorCode, errorDescription, validatedURL);
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Check if server is running
function checkServerReady() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3000', (res) => {
            resolve(true);
        });
        
        req.on('error', () => {
            resolve(false);
        });
        
        req.setTimeout(1000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

// Wait for server to be ready
async function waitForServer(maxAttempts = 15) {
    for (let i = 0; i < maxAttempts; i++) {
        console.log(`Checking server readiness... attempt ${i + 1}`);
        const isReady = await checkServerReady();
        if (isReady) {
            console.log('Server is ready!');
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.error('Server failed to become ready within timeout period');
    return false;
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
    try {
        console.log('Electron app is ready');
        console.log('App path:', app.getAppPath());
        console.log('Resource path:', getResourcePath());
        console.log('Is packaged:', app.isPackaged);
        
        await startServer();
        
        // Wait for server to be ready before creating window
        const serverReady = await waitForServer();
        if (!serverReady) {
            throw new Error('Server failed to start within timeout period');
        }
        
        createWindow();
    } catch (error) {
        console.error('Failed to start application:', error);
        
        // Show error dialog in production
        if (!isDev()) {
            const { dialog } = require('electron');
            dialog.showErrorBox('Application Error', 
                `Failed to start ChunRAG:\n${error.message}\n\nPlease check the console for more details.`);
        }
        
        app.quit();
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        cleanup();
        app.quit();
    }
});

app.on('before-quit', () => {
    cleanup();
});

function cleanup() {
    if (serverProcess && !serverProcess.killed) {
        console.log('Stopping server process...');
        serverProcess.kill('SIGTERM');
        
        // Force kill if it doesn't stop gracefully
        setTimeout(() => {
            if (!serverProcess.killed) {
                serverProcess.kill('SIGKILL');
            }
        }, 5000);
    }
}

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
});
