import fs from 'node:fs';
const path = 'expenses.json';
let data = []
let validCommands = ['add', 'delete', 'list', 'summary']
let validFlags = ['id', 'description', 'amount', 'month']

if (fs.existsSync(path)) data = JSON.parse(fs.readFileSync(path, 'utf8'));
else fs.writeFileSync(path, JSON.stringify([]));


function getFlags() {
    let flags = {};
    let inp = process.argv;
    
    for (let j=0; j<inp.length; j++){
        if (inp[j].startsWith('--')) {
            flags[inp[j].slice(2)] = inp[j+1];
        }
    }
    return flags;
};

const command = process.argv[2];
const flags = getFlags();

function validateId(expenseId) {
    if(!data.some(expense => expense.id === expenseId)){
        console.error(`Expense ID not found. (ID: ${expenseId})`);
        process.exit(1);
    }
};

if (command === 'add') {
    let dateMade = new Date().toISOString();
    if(flags.description && flags.amount) {
        let expense = {
            'id': data.length + 1,
            'date': dateMade,
            'description': flags.description,
            'amount': parseInt(flags.amount)
        }
        data.push(expense);
        fs.writeFileSync(path, JSON.stringify(data));
        console.log(`Expense added successfully. (ID: ${expense.id})`);
    }
    else {
        console.error(`Expense --description or --amount not provided.`)
        process.exit(1);
    }
};

if (command === 'delete') {
    if (flags.id) {
        validateId(parseInt(flags.id));
        data = data.filter(expense => expense.id != parseInt(flags.id));
        fs.writeFileSync(path, JSON.stringify(data));
        console.log(`Expense deleted succesfully (ID: ${flags.id})`);
    }
    else {
        console.error(`Expense --id not provided.`);
        process.exit(1);
    }
};

if (command === 'list') {
    console.table(data)
};

if (command === 'summary') {
    let total = 0;
    const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    if(flags.month) {
        for (const expense of data) {
            let expenseDate = new Date(expense.date).getUTCMonth() + 1;
            if (expenseDate === parseInt(flags.month)){total += expense.amount;} //refactor using filter(month) and reduce(tottal, curr)
        };
        console.log(`Total expenses for month of ${shortMonths[flags.month - 1]}: $${total}.`);
    }
    else {
        for (const expense of data) {total += expense.amount;}
        console.log(`Total expenses: $${total}.`)
    }
};

// fallback funct
if (!validCommands.includes(command)) {
    console.error('Invalid command.');
    process.exit(1);
};