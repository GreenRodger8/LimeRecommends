import sys
import json
#from sklearn import preprocessing

#Create python array from string argument
songArray = json.loads(sys.argv[1]) 

#Get container for first song
firstSongContainer = songArray[0]

#Get name of first song
firstSongName = firstSongContainer["track"]["name"]

#Sorts first song name
outputString = ''.join(sorted(firstSongName))

#Output to Node.js
print ('First song name sorted:', outputString)
