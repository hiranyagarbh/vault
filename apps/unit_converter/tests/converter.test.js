import { test, describe } from 'node:test';
import assert from 'node:assert';
import { convertLength, convertWeight, convertTemperature } from '../utils/converter.js';

describe('Unit Converter Tests', () => {
    describe('Length Conversions', () => {
        test('should convert feet to meter correctly', () => {
            const res = convertLength(20, 'foot', 'meter');
            assert.strictEqual(res, '20 foot = 6.0960 meter');
        });
        test('should convert inches to centimeter correctly', () => {
            const res = convertLength(1, 'inch', 'centimeter');
            assert.strictEqual(res, '1 inch = 2.5400 centimeter');
        });
        test('should not crash on large decimal inputs', () => {
            const res = convertLength(3.3333333333, 'yard', 'foot');
            assert.strictEqual(res, '3.3333333333 yard = 10.0000 foot');
        })
    }); // length conversions

    describe('Temperature Conversions', () => {
        test('should convert Celsius to Fahrenheit', () => {
            const res = convertTemperature(0, 'celsius', 'fahrenheit');
            assert.strictEqual(res, '0 celsius = 32.00 fahrenheit');
        });
        test('should handle same-to-same conversions right', () => {
            const res = convertTemperature(100, 'celsius', 'celsius');
            assert.strictEqual(res, '100 celsius = 100.00 celsius');
        });
        test('should handle negative temperature', () => {
            const res = convertTemperature(-273.15, 'celsius', 'fahrenheit');
            assert.strictEqual(res, '-273.15 celsius = -459.67 fahrenheit');
        });
    }); // temp conversions

    describe('Weight Conversions', () => {
        test('should handle zero weight correctly', () => {
            const res = convertWeight(0, 'kilogram', 'gram');
            assert.strictEqual(res, '0 kilogram = 0.0000 gram');
        });
        test ('should convert gram to pound correctly', () => {
            const res = convertWeight(77.666, 'gram', 'pound');
            assert.strictEqual(res, '77.666 gram = 0.1712 pound');
        });
    }); // weight conversions

    describe('Error Handling', () => {
        test('should throw an error for unknown length units', () => {
            assert.throws (() => {
                convertLength(10, 'foot', 'gallon');

            }, Error, 'Invalid length units: foot or gallon');
        });
    });

})