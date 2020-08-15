import sys
import json
import os
from sklearn import preprocessing
import numpy as np

import jsonTools

LOG_PATH = "./log.txt"
FEATURE_FILE = "songFeatures"
#ID_FILE = "songID"
with open(LOG_PATH, "w") as logStream:
    #Gets path for user's song features from command line argument
    filePath = sys.argv[1]
    logStream.write("\nSave file path from argument: ")
    logStream.write(filePath)
    
    #Path template for file
    featurePath = filePath + FEATURE_FILE;

    #Create read file stream and loads JSON of song features
    with open(featurePath + ".txt", "r") as readStream:
        logStream.write("Opened file to read successfully\n")
        jsonArray = json.load(readStream)
        logStream.write("Loaded json file\n")

    #Create numpy array of song features
    songArray = []
    for songDict in jsonArray:
        songArray.append(jsonTools.getSongArray(songDict))
    featureArray = np.array(songArray)

    #Save song features in .npy file
    np.save(featurePath, featureArray)

    #Delete old .txt file
    os.remove(featurePath + ".txt")

    #Return success
    print ("True", end="")