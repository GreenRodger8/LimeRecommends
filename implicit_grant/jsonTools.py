#Return array of just song attributes from dictionary
#Attributes in array are in this order: Acousticness, Danceability, Energy, Instrumentalness, Loudness, Speechiness, Tempo, Valence
def getSongArray(dictSong):
    songArray = []

    songArray.append(dictSong["acousticness"])
    songArray.append(dictSong["danceability"])
    songArray.append(dictSong["energy"])
    songArray.append(dictSong["instrumentalness"])
    songArray.append(dictSong["loudness"])
    songArray.append(dictSong["speechiness"])
    songArray.append(dictSong["tempo"])
    songArray.append(dictSong["valence"])

    return songArray

