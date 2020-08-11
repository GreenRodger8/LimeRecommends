import sys
import json
import os
from sklearn import preprocessing

import jsonTools

logPath = "./log.txt"
with open(logPath, "w") as logStream:
    logStream.write("Python script running. Created log stream in:\n")
    logStream.write(logPath)
    
    #Gets file path from command line arguments
    filePath = sys.argv[1]
    logStream.write("\nFile path from argument:\n")
    logStream.write(filePath)
    
    #Create read file stream and load JSON from stream if possible
    if os.access(filePath, os.R_OK or os.F_OK):
        logStream.write("\nPasses os.R_OK and os.F_OK. Trying to open reading stream now\n")
        with open(filePath, "r") as readStream:
            logStream.write("Opened file to read successfully\n")
            jsonArray = json.load(readStream)
            logStream.write("Loaded json file\n")
    else:
        logStream.write("Does not pass os.R_OK and os.F_OK")
    
    #Create array of song arrays
    songArrays = []
    for songDict in jsonArray:
        songArrays.append(jsonTools.getSongArray(songDict))
    
    #Preprocess song arrays
    normalizedSongArrays = preprocessing.scale(songArrays);
    
    #Output to file
    writePath = "./centroid.txt"
    with open(writePath, "w") as writeStream:
        writeStream.write(str(normalizedSongArrays))
    
    #Return file path
    print (writePath, end="")