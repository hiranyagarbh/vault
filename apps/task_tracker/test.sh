# Fresh start
rm -f tasks.json

# Add tasks
node task.js add "Buy groceries"
node task.js add "Cook dinner"
node task.js add "Do laundry"
node task.js add "Call mom"
node task.js add "Pay bills"

# List all
node task.js list

# Mark statuses
node task.js mark-in-progress 1
node task.js mark-in-progress 2
node task.js mark-done 1
node task.js mark-done 3

# List by status
node task.js list todo
node task.js list in-progress
node task.js list done

# Update
node task.js update 2 "Cook dinner and dessert"
node task.js update 4 "Call mom and dad"

# List all after updates
node task.js list

# Delete
node task.js delete 3
node task.js delete 5

# List after deletes
node task.js list

# Edge cases
node task.js delete 99           # ID not found
node task.js update 99 "Ghost"   # ID not found
node task.js mark-done 1         # already done
node task.js mark-in-progress 2  # already in-progress
node task.js add                 # missing description