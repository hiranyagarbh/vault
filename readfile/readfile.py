# to open a file
file = open('apache_logs.txt', 'r')
'''

# to create a file
test = open('test.txt', 'w+')

for i in range(1, 10):
    test.write("This is line %d\n" % i) # writes to the file

file = open('test.txt', 'r')

print(file.read())

'''

lines = file.readlines()
ret = []

for x in lines:
    if x.split(' ')[9] == "-":
        pass
    else:
        ret.append(x.split(' ')[9])

# good practice to close the file
file.close()

# ret :: 'str' -> 'int'

# ret = [x for x in ret if isinstance(x, int)]
ret = list(map(int, ret))
print(sum(ret)//len(ret)) #avg
