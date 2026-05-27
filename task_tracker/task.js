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
    // console.log(task)
    fs.writeFileSync(path, JSON.stringify(data));
    console.log(`Task added successfully (ID: ${task.id})`);
}

// == [ DELETE ] ==
if (command === 'delete') {
    let inputId = parseInt(process.argv[3]);
    if(!data.some(task => task.id === inputId))
        throw new Error('ID not found')

    data = data.filter(task => inputId != task.id);
    fs.writeFileSync(path, JSON.stringify(data));
    console.log(`Task deleted successfully (ID: ${inputId})`)
}