rm -f expenses.json

# == ADD ==
node app.js add --description "Lunch" --amount 60
node app.js add --description "Dinner" --amount 40
node app.js add --description "Breakfast" --amount 20
node app.js add --description "Car Repair" --amount 120
node app.js add --description "Rent" --amount 180

# == LIST ==
node app.js list

# == SUMMARY ==
node app.js summary

# == DELETE ==
node app.js delete --id 2
node app.js summary

# == SUMMARY BY MONTH ==
node app.js summary --month 5
node app.js summary --month 6
node app.js summary --month 13   # invalid month

# == UPDATE ==
node app.js update --id 1 --description "Updated Lunch" --amount 65
node app.js update --id 4 --description "Updated Car Parts"
node app.js update --id 5 --amount 185
node app.js list

# == EDGE CASES ==
node app.js delete --id 99          # id not found
node app.js update --id 99          # id not found
node app.js update --id 1           # no description or amount
node app.js add --amount 50         # missing description
node app.js add --description "X"   # missing amount
node app.js add --description "Y" --amount -10   # negative amount
node app.js add --description "Z" --amount 0     # zero amount

# == UNKNOWN FLAGS ==
node app.js add --description "Lunch" --amount 50 --category "food"  # unknown flag
node app.js list --sort asc         # unknown flag

# == UNKNOWN COMMANDS ==
node app.js export
node app.js help

# == NO COMMAND ==
node app.js