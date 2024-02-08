const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let calibrationData = {};
let temperatureData = []; // Array to store temperature values

// Function to generate a random float between min and max
function generateRandomTemperature(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2); // toFixed(2) for two decimal places
}

// Generate and store new temperature data every 100ms
setInterval(() => {
  const newTemperature = generateRandomTemperature(1100.00, 1500.00);
  temperatureData.push(newTemperature);
  console.log('New temperature generated:', newTemperature);
  
  // Optional: Keep the array size manageable
  if (temperatureData.length > 1000) { // Keep the last 1000 data points
    temperatureData.shift(); // Remove the oldest data point
  }
}, 1000);

app.post('/calibrationdata', (req, res) => {
  calibrationData = req.body;
  console.log('Calibration data received:', calibrationData);
  res.json({ message: 'Calibration data received', data: calibrationData });
});

app.get('/calibrationdata', (req, res) => {
  res.json(calibrationData);
});

app.post('/temps', (req, res) => {
  // Assuming the temperature data comes in the request body
  const { temperature } = req.body;
  temperatureData.push(temperature);
  console.log('Temperature data received:', temperature);
  
  res.json({ message: 'Temperature data received', temperature });
});

// Endpoint to get the latest temperature data
app.get('/temps', (req, res) => {
  res.json({ temperature: temperatureData[temperatureData.length - 1] }); // Send the latest temperature
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
