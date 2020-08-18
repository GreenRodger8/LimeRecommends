import sys
import json
import os
import math
from sklearn import preprocessing
import numpy as np

import jsonTools
import minTupleHeapClass as minHeap

FEATURE_PATH = "songFeatures.npy"
ID_PATH = "songID.txt"
REC_PATH = "recommendedSongs.txt"

LOG_PATH = "./log.txt"
with open(LOG_PATH, "w") as logStream:
    
    #Get paths from arguments
    curatorPath = sys.argv[1]
    userPath = sys.argv[2]
    maxRecommendations = (int)(sys.argv[3])

    #Loads song features
    curatorFeatures = np.load(curatorPath + FEATURE_PATH, allow_pickle=True)
    userFeatures = np.load(userPath + FEATURE_PATH, allow_pickle=True)

    #Join dev and user song feature matrices
    superFeatures = np.concatenate((curatorFeatures, userFeatures))

    #Fit standard scaler to superFeatures
    scaler = preprocessing.StandardScaler().fit(superFeatures)

    #Scale dev and user song feature matrices
    curatorFeatures = scaler.transform(curatorFeatures)
    userFeatures = scaler.transform(userFeatures)

    #Get dev and user song centroid
    curatorCentroid = curatorFeatures.mean(axis=0)
    userCentroid = userFeatures.mean(axis=0)

    #Calculate the accessibility of each curator song
    heap = minHeap.MinTupleHeap(maxRecommendations)
    template = np.array([0,0,0,0,0,0,0,0], dtype="float64")
    for index, songArray in enumerate(curatorFeatures):
        representativeness = math.sqrt(np.sum(np.square(np.subtract(curatorCentroid, songArray, out=template), out=template))) #Distance formula
        familiarity = math.sqrt(np.sum(np.square(np.subtract(userCentroid, songArray, out=template), out=template)))
        accessibility = 2/(representativeness+familiarity)
        if not heap.isFull() or accessibility > heap.getSmallest()[0]:
            heap.insert((accessibility, index))
    accessibilityArray = heap.getSortedArray(largestFirst = True)

    #Load curators song ids
    with open(curatorPath + ID_PATH, "r") as readStream:
        curatorIDs = json.load(readStream)

    #Compile recommended song ids and accessibility ratings
    recommendedSongs = []
    for accessibility, index in accessibilityArray:
        recommendedSongs.append({"id": curatorIDs[index], "accessibility": accessibility})

    #Output to text file to view
    recSongPath = userPath + REC_PATH
    with open(recSongPath, "w") as writeStream:
        writeStream.write(json.dumps(recommendedSongs))
    
    #Return file path
    print (recSongPath, end="")