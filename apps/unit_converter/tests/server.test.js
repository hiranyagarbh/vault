import { test, describe } from 'node:test';
import assert from 'node:assert';

describe ('Server Route Tests', () => {
    const BASE_URL = 'http://localhost:3000'; // run server for this to work

    test('Home page should load successfully (200 OK)', async () => {
        const response = await fetch(`${BASE_URL}/`);
        assert.strictEqual(response.status, 200, 'Status code should be 200');
        const html = await response.text();
        assert.ok(html.includes('<title>Unit Converter</title>'), 'HTML should contain the title');
    });
    
    test('Length page load successfully', async () => {
        const response = await fetch(`${BASE_URL}/length`);
        assert.strictEqual(response.status, 200, 'Status code should be 200');
    });

    test('Should return 404 for unkown route/page', async () => {
        const response = await fetch(`${BASE_URL}/food`);
        assert.strictEqual(response.status, 404, 'Status code should be 404');

        const html = await response.text();
        assert.ok(html.includes('404 Not Found'), 'Should show 404 message');
    });
})