const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Configuration for your Django backend
const DJANGO_SERVER_URL = 'http://127.0.0';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // It is best practice to use a preload script for security
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
}

// IPC Listener: Receives data from the renderer process and forwards it to Django
ipcMain.handle('send-to-django', async (event, dataPayload) => {
  try {
    const response = await fetch(DJANGO_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // If your Django server requires authentication (e.g., Token auth)
        // 'Authorization': 'Token your_api_token_here'
      },
      body: JSON.stringify(dataPayload),
    });

    if (!response.ok) {
      throw new Error(`Django server responded with status: ${response.status}`);
    }

    const responseData = await response.json();
    return { success: true, data: responseData };

  } catch (error) {
    console.error('Failed to send data to Django:', error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

