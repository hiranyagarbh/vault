//init
import http from 'node:http';
import fs from 'node:fs';
const port = 3000;

const lengthPage = fs.readFileSync('pages/length.html', 'utf8');
const weightPage = fs.readFileSync('pages/weight.html', 'utf8');
const temperaturePage = fs.readFileSync('pages/temperature.html', 'utf8');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    if (req.method === 'GET' && req.url === '/length') {
        res.write(lengthPage);
    }
    else if (req.method === 'GET' && req.url === '/weight') {
        res.write(weightPage);
    }
    else if (req.method === 'GET' && req.url === '/temperature') {
        res.write(temperaturePage);
    }
    else {
        res.write('<html><body><h1>404 Not Found</h1></body></html>');
    }
    res.end();
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}: http://localhost:${port}`);
});

// press Q to quit the server
process.on('SIGINT', () => {
    server.close(() => {
        console.log('\nServer is shutting down...');
        process.exit(0);
    });
});