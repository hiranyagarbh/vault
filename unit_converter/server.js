import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import querystring from 'node:querystring';

const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const renderPage = async (fileName) => {
    const layoutPath = path.join(__dirname, 'pages', 'layout.html'); //read master layout
    const layoutContent = await fs.readFile(layoutPath, 'utf-8');
    const filePath = path.join(__dirname, 'pages', fileName); // read page content
    const pageContent = await fs.readFile(filePath, 'utf-8');
    const finalHtml = layoutContent.replace('{{content}}', pageContent); // put page content to {{content}} placeholder

    return { status: 200, data: finalHtml };
}

const routes = {
    '/': () => renderPage('index.html'),
    '/length': () => renderPage('length.html'),
    '/weight': () => renderPage('weight.html'),
    '/temperature': () => renderPage('temperature.html')
}

function convertLength(value, from, to) {
    const lengthToMeters = {
        millimeter: 0.001, centimeter: 0.01, meter: 1, kilometer: 1000,
        inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344
    };
    const res = value * lengthToMeters[from] / lengthToMeters[to];
    // formatted
    return `${value} ${from} = ${res.toFixed(4)} ${to}`; 
}

function convertWeight(value, from, to) {
    const weightToGrams = {
        milligram: 0.001, gram: 1, kilogram: 1000, ounce: 28.35, pound: 453.59
    };
    const res = value * weightToGrams[from] / weightToGrams[to];
    return `${value} ${from} = ${res.toFixed(4)} ${to}`;
}

function convertTemperature(value, from, to) {
    let res = null
    if (from === to) res = value;    
    switch(from) {
        case 'celsius':
            if(to === 'fahrenheit') res = (value * 9/5) + 32;
            if(to === 'kelvin') res = value + 273.15;
            break;
        case 'fahrenheit':
            if(to === 'celsius') res = (value - 32) * 5/9;
            if(to === 'kelvin') res = (value - 32) * 5/9 + 273.15;
            break;
        case 'kelvin':
            if(to === 'celsius') res = value - 273.15;
            if(to === 'fahrenheit') res = (value - 273.15) * 9/5 + 32;
            break;
    };
    return `${value} ${from} = ${res.toFixed(2)} ${to}`;
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
            
            req.on('end', async () => {
                const parsed = querystring.parse(body);
                let result = null;
                
                if (url === '/length') result = convertLength(parseFloat(parsed.value), parsed.from, parsed.to);
                if (url === '/weight') result = convertWeight(parseFloat(parsed.value), parsed.from, parsed.to);
                if (url === '/temperature') result = convertTemperature(parseFloat(parsed.value), parsed.from, parsed.to);

                try {
                    const layoutPath = path.join(__dirname, 'pages', 'layout.html');
                    let layoutContent = await fs.readFile(layoutPath, 'utf-8');
                    
                    const resultPagePath = path.join(__dirname, 'pages', 'result.html');
                    let resultHtml = await fs.readFile(resultPagePath, 'utf-8');

                    resultHtml = resultHtml.replace('{{resultText}}', result);
                    // inject res page into the master layout
                    const finalHtml = layoutContent.replace('{{content}}', resultHtml);

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(finalHtml);
                } catch (templateError) {
                    console.error("Template Error: ", templateError);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('<html><body><h1>500 Internal Server Error (Template missing)</h1></body></html>');
                }
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

process.on('SIGINT', () => {
    console.log('\nServer is shutting down...');
    server.close(() => {
        process.exit(0);
    });
});