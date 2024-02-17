const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dgram = require('dgram');
const udpServer = dgram.createSocket('udp4');
const udpClient = dgram.createSocket('udp4');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 1200,
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

ipcMain.on('calibration-start', (event) => {
    const message = Buffer.from('1');
    udpClient.send(message, 2999, '192.168.1.100', (err) => {
        if (err) {
            console.error('Error sending calibration start:', err);
            event.sender.send('calibration-response', 'Failed to start calibration');
            return;
        }
        console.log('Calibration started');
        event.sender.send('calibration-response', 'Calibration started successfully');
    });
});

ipcMain.on('calibration-end', (event) => {
    const message = Buffer.from('0');
    udpClient.send(message, 2999, '192.168.1.100', (err) => {
        if (err) {
            console.error('Error sending calibration end:', err);
            event.sender.send('calibration-response', 'Failed to end calibration');
            return;
        }
        console.log('Calibration ended');
        event.sender.send('calibration-response', 'Calibration ended successfully');
    });
});

udpServer.on('error', (err) => {
    console.log(`UDP Server Error:\n${err.stack}`);
    udpServer.close();
});

udpServer.on('message', (msg, rinfo) => {
    console.log(`UDP Server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    const temperature = parseFloat(msg.toString());
    console.log('Received temperature:', temperature);

    if (mainWindow) {
        mainWindow.webContents.send('udp-temperature', temperature);
    }
});

udpServer.on('listening', () => {
    const address = udpServer.address();
    console.log(`UDP Server listening on ${address.address}:${address.port}`);
});

udpServer.bind(3001, '192.168.1.5');
