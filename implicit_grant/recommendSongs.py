import sys
import json
import os
import math
from sklearn import preprocessing
import numpy as np

import jsonTools

MY_DATA_PATH = "./myData/songFeatures.txt"
LOG_PATH = "./log.txt"
with open(LOG_PATH, "w") as logStream:
    logStream.write("Python script running. Created log stream in:\n")
    logStream.write(LOG_PATH)
    
    #Gets path for user's song features from command line arguments
    filePath = sys.argv[1]
    logStream.write("\nUser file path from argument:\n")
    logStream.write(filePath)

    #Loads JSON of dev song features if possible
    if os.access(MY_DATA_PATH, os.R_OK or os.F_OK):
        logStream.write("\nPasses os.R_OK and os.F_OK. Trying to open reading stream now: ")
        logStream.write(MY_DATA_PATH)
        with open(MY_DATA_PATH, "r") as readStream:
            logStream.write("\nOpened file to read successfully\n")
            devJSON = json.load(readStream)
            logStream.write("Loaded json file\n")
    else:
        logStream.write("\nDoes not pass os.R_OK and os.F_OK")

    #Create matrix of song feature values from dev JSON
    devSongMatrix = []
    for songDict in devJSON:
        devSongMatrix.append(np.array(jsonTools.getSongArray(songDict)))
    devSongMatrix = np.array(devSongMatrix)

    #Loads JSON of user song features if possible
    if os.access(filePath, os.R_OK or os.F_OK):
        logStream.write("\nPasses os.R_OK and os.F_OK. Trying to open reading stream now: ")
        logStream.write(filePath)
        with open(filePath, "r") as readStream:
            logStream.write("\nOpened file to read successfully\n")
            userJSON = json.load(readStream)
            logStream.write("Loaded json file\n")
    else:
        logStream.write("\nDoes not pass os.R_OK and os.F_OK")
    
    #Create matrix of song feature values from user JSON
    userSongMatrix = []
    for songDict in userJSON:
        userSongMatrix.append(np.array(jsonTools.getSongArray(songDict)))
    userSongMatrix = np.array(userSongMatrix)

    #Join dev and user song feature matrices
    superSongMatrix = np.concatenate((devSongMatrix, userSongMatrix))

    #Fit standard scaler to superSongMatrix
    scaler = preprocessing.StandardScaler().fit(superSongMatrix)

    #Scale dev and user song feature matrices
    devSongMatrix = scaler.transform(devSongMatrix)
    userSongMatrix = scaler.transform(userSongMatrix)

    #Get dev and user song centroid
    devSongCentroid = devSongMatrix.mean(axis=0)
    userSongCentroid = userSongMatrix.mean(axis=0)

    #Calculate the accessibility of each dev song
    accessibilityArray = []
    template = np.array([0,0,0,0,0,0,0,0], dtype="float64")
    for songArray in devSongMatrix:
        representativeness = math.sqrt(np.sum(np.square(np.subtract(devSongCentroid, songArray, out=template), out=template)))
        familiarity = math.sqrt(np.sum(np.square(np.subtract(userSongCentroid, songArray, out=template), out=template)))
        accessibilityArray.append((representativeness+familiarity)/2)
    accessibilityArray = np.array(accessibilityArray)
    #Only produces an array of size 8. WHYYYYYY???



    ##############
    #Get max song#
    ##############

    #Output to text file to view
    writePath = sys.argv[2]
    accessibilityArray.tofile(writePath, sep=" ", format="%06.3f")
    #with open(writePath, "w") as writeStream:
        #writeStream.write(str(accessibilityArray))
    
    #Return file path
    print (writePath, end="")