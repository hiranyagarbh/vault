import fs from 'node:fs';
const path = 'expenses.json';
let data = []
let validCommands = ['add', 'delete', 'list', 'summary', 'update']
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

function validateFlag(flags) {
    let flag_keys = Object.keys(flags);
    if(!flag_keys.every(key => validFlags.includes(key))) {
        let unknown_keys = flag_keys.filter(key => !validFlags.includes(key));
        console.error(`Unknown Flag(s): ${unknown_keys}`);
        process.exit(1);
    }
};

const command = process.argv[2];
const flags = getFlags();
validateFlag(flags);

function validateId(expenseId) {
    if(!data.some(expense => expense.id === expenseId)){
        console.error(`Expense ID not found. (ID: ${expenseId})`);
        process.exit(1);
    }
};

function getMonthName(monthNum) {
    if (monthNum >= 1 && monthNum <= 12){
        return new Date(2026, monthNum - 1).toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    }
    else {
        console.error(`Invalid month provided (month: ${monthNum}).`);
        process.exit(1);
    }
}

function getExpense(expenseId) {
    let expense = data.find(expense => expense.id === expenseId);
    return expense;
}

if (command === 'add') {
    let dateMade = new Date().toISOString();
    if(flags.description && flags.amount && parseInt(flags.amount) > 0) {
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
        console.log(`Expense deleted succesfully (ID: ${flags.id}).`);
    }
    else {
        console.error(`Expense --id not provided.`);
        process.exit(1);
    }
};

if (command === 'update') {
    if (flags.id) {
        validateId(parseInt(flags.id));
        let expense = getExpense(parseInt(flags.id));
        let message = ''
        
        if (flags.description && flags.amount){
            expense.description = flags.description;
            expense.amount = parseInt(flags.amount);
            message = `Expense description and amount updated. (ID: ${parseInt(flags.id)})`;
        }
        else if(flags.description) {
            expense.description = flags.description;
            message = `Expense description updated. (ID: ${parseInt(flags.id)})`;
        } 
        else if (flags.amount){
            expense.amount = parseInt(flags.amount);
            message = `Expense amount updated. (ID: ${parseInt(flags.id)})`;
        }
        else {
            console.error(`New expense --description or --amount not provided.`);
            process.exit(1);
        }
        fs.writeFileSync(path, JSON.stringify(data));
        console.log(message);
    }
    else {
        console.error(`Expense --id not provided.`);
        process.exit(1);
    }
}

if (command === 'summary') {
    let total = 0;
    if(flags.month) {
        const monthTotal = data.filter(expense => (new Date(expense.date).getUTCMonth() + 1) === parseInt(flags.month)).reduce((total, curr) => total + parseInt(curr.amount), 0);
        console.log(`Total expenses for month of ${getMonthName(flags.month)}: $${monthTotal}.`);
    }
    else {
        total = data.reduce((total, curr) => total + parseInt(curr.amount), 0)
        console.log(`Total expenses: $${total}.`)
    }
};

if (command === 'list') {console.table(data)};

// fallback funct
if (!validCommands.includes(command)) {
    console.error('Invalid command.');
    process.exit(1);
};