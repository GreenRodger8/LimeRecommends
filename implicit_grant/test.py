import sys
import json

#Creates JSON object from String
jsonContainer = json.loads(sys.argv[1]) 

#Sorts string
outputString = ''.join(sorted(jsonContainer["auth"]))

#Output to Node.js
print ('JSON Parsed Argument:', outputString)