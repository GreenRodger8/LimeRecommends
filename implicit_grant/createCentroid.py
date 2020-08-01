import sys
import json
from sklearn import preprocessing

import jsonTools

#Creates Dictionary from JSON object in String argument
jsonContainer = json.loads(sys.argv[1]) 

#Create array of song arrays
songArrays = []
for songDict in jsonContainer["items"]:
    songArrays.append(jsonTools.getSongArray(songDict))


#Output to Node.js
listToStr = '\n'.join([str(song) for song in songArrays])
print ('Songs in Array: ', listToStr)
