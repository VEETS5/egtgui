document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('calibrationSetOn').addEventListener('click', () => {
        window.electronAPI.startCalibration();
    });

    document.getElementById('calibrationSetOff').addEventListener('click', () => {
        window.electronAPI.endCalibration();
    });

    window.electronAPI.onCalibrationResponse((event, message) => {
        console.log(message);
        document.getElementById('info').textContent = message;
    });

    window.electronAPI.onTemperatureUpdate((event, data) => {
        const { cylinder1, cylinder2, cylinder3, cylinder4 } = data;
        console.log('Received temperatures:', cylinder1, cylinder2, cylinder3, cylinder4);
        updateGraphs(cylinder1, cylinder2, cylinder3, cylinder4);
    });

    const initialDataCount = 15;
    const initialData = {
        cylinder1: Array(initialDataCount).fill(0),
        cylinder2: Array(initialDataCount).fill(0),
        cylinder3: Array(initialDataCount).fill(0),
        cylinder4: Array(initialDataCount).fill(0),
    };
    const initialLabels = Array(initialDataCount).fill('').map((_, i) => i.toString());

    const ctx1 = document.getElementById('liveGraph1').getContext('2d');
    const ctx2 = document.getElementById('liveGraph2').getContext('2d');
    const ctx3 = document.getElementById('liveGraph3').getContext('2d');
    const ctx4 = document.getElementById('liveGraph4').getContext('2d');

    const liveGraph1 = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: initialLabels,
            datasets: [{
                label: 'Cylinder 1 Temperature',
                data: initialData.cylinder1,
                borderColor: 'red',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    const liveGraph2 = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: initialLabels,
            datasets: [{
                label: 'Cylinder 2 Temperature',
                data: initialData.cylinder2,
                borderColor: 'orange',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    const liveGraph3 = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: initialLabels,
            datasets: [{
                label: 'Cylinder 3 Temperature',
                data: initialData.cylinder3,
                borderColor: 'green',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    const liveGraph4 = new Chart(ctx4, {
        type: 'line',
        data: {
            labels: initialLabels,
            datasets: [{
                label: 'Cylinder 4 Temperature',
                data: initialData.cylinder4,
                borderColor: 'blue',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    async function updateGraphs(cylinder1,cylinder2,cylinder3,cylinder4) {
        const now = new Date();
        const label = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

        document.getElementById('cylinder1Temp').textContent = `Cylinder 1: ${cylinder1.toFixed(2)}°C`;
        document.getElementById('cylinder2Temp').textContent = `Cylinder 2: ${cylinder2.toFixed(2)}°C`;
        document.getElementById('cylinder3Temp').textContent = `Cylinder 3: ${cylinder3.toFixed(2)}°C`;
        document.getElementById('cylinder4Temp').textContent = `Cylinder 4: ${cylinder4.toFixed(2)}°C`;

        initialData.cylinder1.shift();
        initialData.cylinder1.push(cylinder1);

        initialData.cylinder2.shift();
        initialData.cylinder2.push(cylinder2);

        initialData.cylinder3.shift();
        initialData.cylinder3.push(cylinder3);

        initialData.cylinder4.shift();
        initialData.cylinder4.push(cylinder4);

        liveGraph1.data.labels.shift();
        liveGraph1.data.labels.push(label);

        liveGraph2.data.labels.shift();
        liveGraph2.data.labels.push(label);

        liveGraph3.data.labels.shift();
        liveGraph3.data.labels.push(label);

        liveGraph4.data.labels.shift();
        liveGraph4.data.labels.push(label);

        liveGraph1.data.datasets.forEach((dataset) => {
            dataset.data = [...initialData.cylinder1];
        });

        liveGraph2.data.datasets.forEach((dataset) => {
            dataset.data = [...initialData.cylinder2];
        });

        liveGraph3.data.datasets.forEach((dataset) => {
            dataset.data = [...initialData.cylinder3];
        });

        liveGraph4.data.datasets.forEach((dataset) => {
            dataset.data = [...initialData.cylinder4];
        });

        liveGraph1.update();
        liveGraph2.update();
        liveGraph3.update();
        liveGraph4.update();
    }
});