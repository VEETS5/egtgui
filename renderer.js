document.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners once the DOM is fully loaded
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

    async function updateGraph() {
        try {
            const data = await window.electronAPI.fetchTemperatureData();
            const temperature = data.temperature;

            const now = new Date();
            const label = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

            initialData.shift();
            initialData.push(temperature);

            liveGraph.data.labels.shift();
            liveGraph.data.labels.push(label);

            liveGraph.update();
        } catch (error) {
            console.error('Error fetching temperature data:', error);
        }
    }
    setInterval(updateGraph, 1000);
});
