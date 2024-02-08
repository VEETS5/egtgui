const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startCalibration: () => ipcRenderer.send('calibration-start'),
    endCalibration: () => ipcRenderer.send('calibration-end'),
    onCalibrationResponse: (callback) => ipcRenderer.on('calibration-response', callback),
    fetchTemperatureData: async () => {
        const response = await fetch('http://localhost:3000/temps');
        return response.json();
    },
});
