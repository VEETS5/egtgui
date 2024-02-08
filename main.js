const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios'); 

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), 
            contextIsolation: true,
            nodeIntegration: false,
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('calibration-start', async (event) => {
    try {
        const response = await axios.post('http://localhost:3000/calibrationdata', { value: 1 });
        console.log('Calibration started:', response.data);
        event.sender.send('calibration-response', 'Calibration started successfully');
    } catch (error) {
        console.error('Error starting calibration:', error);
        event.sender.send('calibration-response', 'Failed to start calibration');
    }
});

ipcMain.on('calibration-end', async (event) => {
    try {
        const response = await axios.post('http://localhost:3000/calibrationdata', { value: 0 });
        console.log('Calibration ended:', response.data);
        event.sender.send('calibration-response', 'Calibration ended successfully');
    } catch (error) {
        console.error('Error ending calibration:', error);
        event.sender.send('calibration-response', 'Failed to end calibration');
    }
});
