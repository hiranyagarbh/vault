import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import querystring from 'node:querystring';

const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const renderPage = async (fileName) => {
    const filePath = path.join(__dirname, 'pages', fileName);
    const content = await fs.readFile(filePath, 'utf-8');
    return { status: 200, data: content };
}

const routes = {
    '/': () => renderPage('index.html'),
    '/length': () => renderPage('length.html'),
    '/weight': () => renderPage('weight.html'),
    '/temperature': () => renderPage('temperature.html')
}

function convertLength(value, from, to) {
    // foot -> Meters -> Centimeter == convert everythig through meters
    // res = calue * lengthToMeters[from] / lengthToMeters[to]
    const lengthToMeters = {
        millimeter: 0.001,
        centimeter: 0.01,
        meter: 1,
        kilometer: 1000,
        inch: 0.0254,
        foot: 0.3048,
        yard: 0.9144,
        mile: 1609.344
    };
    const res = value * lengthToMeters[from] / lengthToMeters[to];
    return `Converted length: ${value} from ${from} to ${to}: ${res}`;
}
function convertWeight(value, from, to) {
    return `Converted weight: ${value} from ${from} to ${to}`;
}
function convertTemperature(value, from, to) {
    return `Converted temperature: ${value} from ${from} to ${to}`;
}

const server = http.createServer(async (req, res) => {
    const {url, method} = req;

    try {
        if (routes[url] && method === 'GET') {
            const response = await routes[url]();

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(response.data);
        }
        else if (routes[url] && method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const parsed = querystring.parse(body);
                let result = null;
                if (url === '/length') result = convertLength(parsed.value, parsed.from, parsed.to)
                if (url === '/weight') result = convertWeight(parsed.value, parsed.from, parsed.to)
                if (url === '/temperature') result = convertTemperature(parsed.value, parsed.from, parsed.to)

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`<html><body><h1>POST successful to ${url}</h1><p>Received body: ${result}</p></body></html>`);
            });
        }
        else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<html><body><h1>404 Not Found</h1></body></html>');
        }
    }
    catch (error) {
        console.error("Server Error: ", error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<html><body><h1>500 Internal Server Error</h1></body></html>');
        
    }
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}: http://localhost:${port}`);
    console.log(`Press Cmd+C to quit the server.`);
});

// press Q to quit the server
process.on('SIGINT', () => {
    console.log('\nServer is shutting down...');
    server.close(() => {
        process.exit(0);
    });
});