export function convertLength(value, from, to) {
    const lengthToMeters = {
        millimeter: 0.001, centimeter: 0.01, meter: 1, kilometer: 1000,
        inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344
    };

    if (!lengthToMeters[from] || !lengthToMeters[to]) {throw new Error(`Invalid length units: %{from} or ${to}`)};
    
    const res = value * lengthToMeters[from] / lengthToMeters[to];
    return `${value} ${from} = ${res.toFixed(4)} ${to}`; 
}

export function convertWeight(value, from, to) {
    const weightToGrams = {milligram: 0.001, gram: 1, kilogram: 1000, ounce: 28.35, pound: 453.59};
    const res = value * weightToGrams[from] / weightToGrams[to];
    return `${value} ${from} = ${res.toFixed(4)} ${to}`;
}

export function convertTemperature(value, from, to) {
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