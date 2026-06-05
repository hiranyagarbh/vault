    const fs = require('fs');

const path = 'tasks.json';
let data = [];
let validCommand = ['add', 'delete', 'update', 'mark-in-progress', 'mark-done', 'list']

if (fs.existsSync(path)) data = JSON.parse(fs.readFileSync(path, 'utf8'));
else fs.writeFileSync(path, JSON.stringify([]));

const command = process.argv[2];
const argument = process.argv[3];

// ====== { REFACTORING } ========
function getInputId() { 
    let inputId = parseInt(process.argv[3]);
    return inputId;
 }
function validateId(inputId) { 
    if(!data.some(task => task.id === inputId)) {
        console.error(`ID not found. (ID: ${inputId})`);
        process.exit(1);
    }
 }
function getTask(inputId) { 
    let task = data.find(task => task.id === inputId);
    return task;
 }

// == [ ADD ] ==
if (command === 'add') {
    let dateMade = new Date().toISOString()
    if (argument) {
        let task = {
            'id': data.length + 1,
            'description': argument,
            'status': 'todo',
            'createdAt': dateMade,
            'updatedAt': dateMade
        }
        data.push(task);
        fs.writeFileSync(path, JSON.stringify(data));
        console.log(`Task added successfully. (ID: ${task.id})`);
    }
    else {
        console.error(`Task description not provided.`);
        process.exit(1);
    }
}

// == [ DELETE ] ==
if (command === 'delete') {
    let inputId = getInputId();
    validateId(inputId);

    data = data.filter(task => inputId != task.id);
    fs.writeFileSync(path, JSON.stringify(data));
    console.log(`Task deleted successfully. (ID: ${inputId})`);
}

// == [ UPDATE ] ==
if (command === 'update') {
    let inputId = getInputId();
    validateId(inputId);
    let newDescription = process.argv[4];

    let task = getTask(inputId);

    if (task.description === newDescription) {
        console.error(`Description already exists. (ID: ${inputId})`);
        process.exit(1);
    }
    task.description = newDescription;
    task.updatedAt = new Date().toISOString();
    
    fs.writeFileSync(path, JSON.stringify(data));
    console.log(`Task updated successfully. (ID: ${inputId})`);
}

// == [ MARK IN-PROGRESS ] ==
if (command === 'mark-in-progress') {
    let inputId = parseInt(getInputId());
    validateId(inputId);
    
    let task = getTask(inputId);

    if(task.status === 'in-progress') {
        console.error(`Task already marked in-progress. (ID: ${inputId})`);
        process.exit(1);
    }
    task.status = 'in-progress';
    task.updatedAt = new Date().toISOString();

    fs.writeFileSync(path, JSON.stringify(data));
    console.log(`Task marked in-progress successfully. (ID: ${inputId})`);
}

// == [ MARK DONE ] ==
if (command === 'mark-done') {
    let inputId = parseInt(getInputId());
    validateId(inputId);
    
    let task = getTask(inputId);

    if(task.status === 'done') {
        console.error(`Task already marked done. (ID: ${inputId})`);
        process.exit(1);
    }
    task.status = 'done';
    task.updatedAt = new Date().toISOString();

    fs.writeFileSync(path, JSON.stringify(data));
    console.log(`Task marked done successfully. (ID: ${inputId})`);
}

// == [ TASK LIST ] ==
if (command === 'list') {
    if (process.argv[3]) {console.log(data.filter(task => task.status === process.argv[3]));}
    else {console.log(data);}
}

// fallback funct
if (!validCommand.includes(command)) {
    console.error('Invalid Command');
    process.exit(1);
}


