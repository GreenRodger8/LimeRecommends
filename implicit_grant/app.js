/**
 * This is an example of a basic node.js script that performs
 * the Implicit Grant oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#implicit_grant_flow
 */

const express = require('express');
const os = require('os');

//Custom functions
const { spawnPython } = require('./customJS/python.js');
const { createTrimFunction, joinSubArrays } = require('./customJS/trimJSON.js');
const { writeToFile, readFromFile, createDirectory, checkPath, getDirectoryNames } = require('./customJS/ioStream.js');
const spotifyRequest = require('./customJS/spotifyRequest.js');

//Data paths
const SAVED_PATH_TEMPLATE = './savedData/';
const TEMP_PATH_TEMPLATE = './tempData/';

//Constant values
const MAX_TRACKS = 3000;

//Targeted song features
const SONG_FEATURES = ["acousticness", "danceability", "energy", "instrumentalness", "loudness", "speechiness", "tempo", "valence"];

//  Express server section
const app = express();

app.use(express.static(__dirname + '/public')); //Serves index.html
app.use(express.json()); //For parsing application/json
app.use(express.urlencoded({ extended: true })); //For parsing application/x-www-form-urlencoded

async function getAllFiles(basePath, filePath) {
    try {
        var directoryNames = await getDirectoryNames(basePath);
        var fileContents = [];
        for (directoryName of directoryNames) {
            var content = await readFromFile(basePath + directoryName + '/' + filePath);
            fileContents.push({ directory: directoryName, content: content });
        }
    } catch (err) {
        console.error(`Error trying to get contents from file:: ${err}`);
    } finally {
        return fileContents;
    }
};

app.get('/curators/', async function (req, res) {
    try {
        var files = await getAllFiles(SAVED_PATH_TEMPLATE, 'displayName.txt');
    } catch (err) {
        console.error(`Error trying to get list of curators:: ${err}`);
    } finally {
        var curators = files.map(file => { return { id: file.directory, displayName: file.content } });
        console.log(`Curators to send to client: ${JSON.stringify(curators)}`);
        res.json(curators);
    }
});

app.put('/curator/', async function (req, res) {
    try {
        console.log(`Received [ ${req.method} ${req.originalUrl} ] request`);
        let auth = req.get('Authorization');

        //Get user's id and display name
        var userObject = await spotifyRequest.userProfile(auth);
        console.log(`[ ${req.method} ${req.originalUrl} ] request for user [ ${userObject.id} ] with display name [ ${userObject.display_name} ]`);

        //Create directory for user
        let userPath = SAVED_PATH_TEMPLATE + userObject.id + '/';
        await createDirectory(userPath);
        await writeToFile(userPath + 'displayName.txt', userObject.display_name);
        console.log(`Created directory for user [ ${userObject.id} ]`);

        //Get IDs of saved tracks in a user's library, up to MAX_TRACKS amount
        const trimID = createTrimFunction([["track", "id"]]);
        let tracks = await spotifyRequest.userSavedTracks(auth, trimID, MAX_TRACKS);
        let trackIDs = tracks.map(track => track["id"]);
        console.log(`Retrieved saved tracks for user [ ${userObject.id} ]`);

        //Get track features 
        const trimAudioFeatures = (response) => response["audio_features"].map(createTrimFunction(SONG_FEATURES));
        let trackFeatures = await spotifyRequest.severalTrackFeatures(auth, trimAudioFeatures, trackIDs);
        trackFeatures = joinSubArrays(trackFeatures);
        console.log(`Retrieved track features for user [ ${userObject.id} ]`);

        //Write song features and song ID JSON to text file
        let featurePromise = writeToFile(userPath + 'songFeatures.txt', JSON.stringify(trackFeatures));
        let idPromise = writeToFile(userPath + 'songID.txt', JSON.stringify(trackIDs));
        await Promise.all([featurePromise, idPromise]);
        console.log(`Saved track features and ids for user [ ${userObject.id} ] in text files`);

        //Run python script to preprocess user track features
        await spawnPython('storeLibrary', [userPath]);
        console.log(`Preprocessed track features for user [ ${userObject.id} ]`);

        //Return new list of curators to client
        let files = await getAllFiles(SAVED_PATH_TEMPLATE, 'displayName.txt');
        let curators = files.map(file => { return { id: file.directory, displayName: file.content } });
        console.log(`List of curators to send to client: ${JSON.stringify(curators)}`);

        res.json(curators);
    } catch (err) {
        console.error(`Error in [ ${req.method} ${req.originalUrl} ] request for user [ ${userObject.id} ]:: ${err}`);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/recommendation/:curator', async function (req, res) {
    try {
        console.log(`Received [ ${req.method} ${req.originalUrl} ] request`);
        let auth = req.get('Authorization');

        //Get user's id and display name
        var userObject = await spotifyRequest.userProfile(auth);
        console.log(`[ ${req.method} ${req.originalUrl} ] request for user [ ${userObject.id} ] with display name [ ${userObject.display_name} ]`);

        //Check if curator data exists
        //Potentially a security hazard because req.params.curator is received from user
        let curatorPath = SAVED_PATH_TEMPLATE + req.params.curator + '/';
        let curatorExists = await checkPath(curatorPath + 'displayName.txt');
        if (curatorExists === false) req.json("Curator does not exist");
        console.log(`Curator [ ${req.params.curator} ] exists`);

        //Check if new directory needs to be created for user. If true, must add song data temporarily. If false, skip
        var userPath = SAVED_PATH_TEMPLATE + userObject.id + '/';
        let userExists = await checkPath(userPath);
        console.log(`Checked if user [ ${userObject.id} ] exists`);

        if (userExists === false) {
            console.log(`User [ ${userObject.id} ] does not exist`);

            //Create temporary directory for user
            userPath = TEMP_PATH_TEMPLATE + userObject.id + '/';
            await createDirectory(userPath);
            console.log(`Created temporary directory for user [ ${userObject.id} ]`);

            //Get IDs of saved tracks in a user's library, up to MAX_TRACKS amount
            const trimID = createTrimFunction([["track", "id"]]);
            let tracks = await spotifyRequest.userSavedTracks(auth, trimID, MAX_TRACKS);
            let trackIDs = tracks.map(track => track["id"]);
            console.log(`Retrieved saved tracks for user [ ${userObject.id} ]`);

            //Get track features 
            const trimAudioFeatures = (response) => response["audio_features"].map(createTrimFunction(SONG_FEATURES));
            let trackFeatures = await spotifyRequest.severalTrackFeatures(auth, trimAudioFeatures, trackIDs);
            trackFeatures = joinSubArrays(trackFeatures);
            console.log(`Retrieved track features for user [ ${userObject.id} ]`);

            //Write song features and song ID JSON to text file
            let featurePromise = writeToFile(userPath + 'songFeatures.txt', JSON.stringify(trackFeatures));
            let idPromise = writeToFile(userPath + 'songID.txt', JSON.stringify(trackIDs));
            await Promise.all([featurePromise, idPromise]);
            console.log(`Saved track features and ids for user [ ${userObject.id} ] in text files`);

            //Run python script to preprocess user track features
            await spawnPython('storeLibrary', [userPath]);
            console.log(`Preprocessed track features for user [ ${userObject.id} ]`);

        } else {
            console.log(`User [ ${userObject.id} ] exists`);
        }

        //Run script to get recommended songs
        const maxRecs = 20;
        let recPath = await spawnPython('recommendSongs', [curatorPath, userPath, maxRecs]);
        let recData = await readFromFile(recPath);
        let recJSON = JSON.parse(recData);
        console.log(`Processed recommendations for user [ ${userObject.id} ]`);

        res.json(recJSON);
    } catch (err) {
        console.error(`Error in [ ${req.method} ${req.originalUrl} ] request for user [ ${userObject.id} ]:: ${err}`);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/test', function (req, res) {
    res.status(200).end();
});

if (process.argv[2] === 'test') {
    console.log('Listening on 8888');
    app.listen(8888);
}
else {
    console.log('Listening on 80');
    app.listen(80);
}


