const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dgram = require('dgram');

// server used for receiving
const udpServer = dgram.createSocket('udp4');
// client used for sending 
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
    udpClient.send(message, 55151, '192.168.1.100', (err) => {
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
    udpClient.send(message, 55151, '192.168.1.100', (err) => {
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
    console.log(`UDP Server got: ${msg.toString('hex')} from ${rinfo.address}:${rinfo.port}`);
    
    // Ensure the message is at least 16 bytes (4 bytes per temperature * 4 temperatures)
    if (msg.length >= 16) {
        // Decode each 32-bit float (IEEE 754, big endian)
        const cylinder1 = msg.readFloatLE(0);  // First temperature
        const cylinder2 = msg.readFloatLE(4);  // Second temperature
        const cylinder3 = msg.readFloatLE(8);  // Third temperature
        const cylinder4 = msg.readFloatLE(12); // Fourth temperature

        console.log(`Received temperatures (decoded): ${cylinder1}, ${cylinder2}, ${cylinder3}, ${cylinder4}`);

        if (mainWindow) {
            mainWindow.webContents.send('udp-temperature', {cylinder1, cylinder2, cylinder3, cylinder4});
        }
    } else {
        console.error('Received packet is smaller than expected for 4 temperatures.');
    }
});



udpServer.on('listening', () => {
    const address = udpServer.address();
    console.log(`UDP Server listening on ${address.address}:${address.port}`);
});

udpServer.bind(55151, '192.168.1.100');