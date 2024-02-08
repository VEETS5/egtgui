const { spawn } = require('child_process');
const path = require('path');

const serverPath = path.join(process.cwd(), 'server.js')
const server = spawn('node', [serverPath], { stdio: 'inherit' });
server.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1); 
});
server.on('close', (code) => {
    if (code !== 0) {
        console.error(`Server process exited with code ${code}`);
    }
})


server.on('spawn', () => {
    const electronPath = require('electron'); 
    const app = spawn(electronPath.toString(), ['.'], { stdio: 'inherit' });
    app.on('error', (err) => {
        console.error('Failed to start Electron app:', err);
    });
    app.on('close', (code) => {
        if (code !== 0) {
            console.error(`Electron app exited with code ${code}`);
        }
    });
});
