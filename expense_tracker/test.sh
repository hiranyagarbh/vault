rm -f expenses.json

# add
node app.js add --description "Lunch" --amount 60
node app.js add --description "Dinner" --amount 40
node app.js add --description "Breakfast" --amount 20
node app.js add --description "Car Repair" --amount 120
node app.js add --description "Rent" --amount 180

# list
node app.js list
#summary
node app.js summary

node app.js delete --id 2
node app.js summary

#summary by month
node app.js summary --month 5

# update
node app.js update --id 1 --description "Updated_Lunch" --amount 65
node app.js update --id 4 --description "Updated_Car_Parts"
node app.js update --id 5 --amount 185