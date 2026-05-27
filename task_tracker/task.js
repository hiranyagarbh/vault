const fs = require('fs');

const path = 'tasks.json';
let data = []

if (fs.existsSync(path)) data = JSON.parse(fs.readFileSync(path, 'utf8'));
else fs.writeFileSync(path, JSON.stringify([]));

const command = process.argv[2];
const argument = process.argv[3];

// == [ ADD ] ==
if (command === 'add') {
    let dateMade = new Date().toISOString()
    let task = {
        'id': data.length + 1,
        'description': argument,
        'status': 'todo',
        'createdAt': dateMade,
        'updatedAt': dateMade
    }
    data.push(task)
    fs.writeFileSync(path, JSON.stringify(data));
    console.log(`Task added successfully. (ID: ${task.id})`);
}

// == [ DELETE ] ==
if (command === 'delete') {
    let inputId = parseInt(process.argv[3]);
    if(!data.some(task => task.id === inputId))
        throw new Error(`ID not found (ID: ${inputId})`)

    data = data.filter(task => inputId != task.id);
    fs.writeFileSync(path, JSON.stringify(data));
    console.log(`Task deleted successfully. (ID: ${inputId})`)
}

// == [ UPDATE ] ==
if (command === 'update') {
    let inputId = parseInt(process.argv[3]);
    let newDescription = process.argv[4];

    if(!data.some(task => task.id === inputId))
        throw new Error(`ID not found. (ID: ${inputId})`)

    let task = data.find(task => task.id === inputId)
    if (task.description === newDescription)
        throw new Error(`Description already exists. (ID: ${inputId})`)
    task.description = newDescription
    task.updatedAt = new Date().toISOString()
    
    fs.writeFileSync(path, JSON.stringify(data));
    console.log(`Task updated successfully. (ID: ${inputId})`)
}

// == [ MARK IN-PROGRESS ] ==
if (command === 'mark-in-progress') {
    let inputId = parseInt(process.argv[3]);
    if(!data.some(task => task.id === inputId))
        throw new Error(`ID not found. (ID: ${inputId})`)
    
    let task = data.find(task => task.id === inputId)
    if(task.status === 'in-progress')
        throw new Error(`Task already marked in-progress. (ID: ${inputId})`)
    task.status = 'in-progress'
    task.updatedAt = new Date().toISOString()

    fs.writeFileSync(path, JSON.stringify(data));
    console.log(`Task marked in-progress successfully. (ID: ${inputId})`)
}

// == [ MARK DONE ] ==
if (command === 'mark-done') {
    let inputId = parseInt(process.argv[3]);
    if(!data.some(task => task.id === inputId))
        throw new Error(`ID not found. (ID: ${inputId})`)
    
    let task = data.find(task => task.id === inputId)
    if(task.status === 'done')
        throw new Error(`Task already marked done. (ID: ${inputId})`)
    task.status = 'done'
    task.updatedAt = new Date().toISOString()

    fs.writeFileSync(path, JSON.stringify(data));
    console.log(`Task marked done successfully. (ID: ${inputId})`)
}