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

    window.electronAPI.onTemperatureUpdate((event, temperature) => {
        console.log('Received temperature:', temperature);
        document.getElementById('temperatureDisplay').textContent = `Latest Temperature: ${temperature}°C`;
    });

    const initialDataCount = 15;
    const initialData = Array(initialDataCount).fill(0);
    const initialLabels = Array(initialDataCount).fill('').map((_, i) => i.toString());
    const ctx = document.getElementById('liveGraph').getContext('2d');
    const liveGraph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: initialLabels,
            datasets: [{
                label: 'Temperature (Fahrenheit)',
                data: initialData,
                borderColor: 'rgb(75, 192, 192)',
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

    async function updateGraph(temperature) {
        const now = new Date();
        const label = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

        initialData.shift();
        initialData.push(temperature);

        liveGraph.data.labels.shift();
        liveGraph.data.labels.push(label);

        liveGraph.data.datasets.forEach((dataset) => {
            dataset.data = [...initialData];
        });

        liveGraph.update();
    }

    // update when we recieve a packet brah
    window.electronAPI.onTemperatureUpdate((event, temperature) => {
        updateGraph(temperature);
    });
});
