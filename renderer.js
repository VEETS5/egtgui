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
    
    const ctx = document.getElementById('liveGraph').getContext('2d');
        const liveGraph = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Temperature (Fahrenheit)',
                    data: [],
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
            const label = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
            
            const liveGraph = Chart.getChart("liveGraph"); // Access the chart instance
            liveGraph.data.labels.push(label);
            liveGraph.data.datasets.forEach((dataset) => {
                dataset.data.push(temperature);
            });
            
            if (liveGraph.data.labels.length > 30) {
                liveGraph.data.labels.shift();
                liveGraph.data.datasets.forEach((dataset) => {
                    dataset.data.shift();
                });
            }
            
            liveGraph.update();
        } catch (error) {
            console.error('Error fetching temperature data:', error);
        }
    }
    setInterval(updateGraph, 1000);
});
