#Return array of just song attributes from dictionary
#Attributes in array are in this order: Acousticness, Danceability, Energy, Instrumentalness, Loudness, Speechiness, Tempo, Valence
def getSongArray(dictSong):
    songArray = []

    songArray.append(dictSong["Acousticness"])
    songArray.append(dictSong["Danceability"])
    songArray.append(dictSong["Energy"])
    songArray.append(dictSong["Instrumentalness"])
    songArray.append(dictSong["Loudness"])
    songArray.append(dictSong["Speechiness"])
    songArray.append(dictSong["Tempo"])
    songArray.append(dictSong["Valence"])

    return songArray

