const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startCalibration: () => ipcRenderer.send('calibration-start'),
    endCalibration: () => ipcRenderer.send('calibration-end'),
    onCalibrationResponse: (callback) => ipcRenderer.on('calibration-response', callback),
    onTemperatureUpdate: (callback) => {
        ipcRenderer.on('udp-temperature', (event, temperature) => {
            callback(temperature);
        });
    },
});
