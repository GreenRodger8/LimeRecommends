/**
 * This is an example of a basic node.js script that performs
 * the Implicit Grant oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#implicit_grant_flow
 */

var express = require('express');

//Custom functions
const { makeRequest, chainRequests, concurrentRequests } = require('./customJS/webRequest.js');
const { spawnPython } = require('./customJS/python.js');
const { createTrimFunction, createSubArrays, joinSubArrays } = require('./customJS/trimJSON.js');
const { writeToFile, readFromFile, createDirectory, checkPath, getDirectoryNames } = require('./customJS/ioStream.js')

//Data paths
const savePathTemplate = './savedData/';
const tempPathTemplate = './tempData/';

//Targeted song features
const songFeatures = ["acousticness", "danceability", "energy", "instrumentalness", "loudness", "speechiness", "tempo", "valence"];

//  Express server section
var app = express();

app.use(express.static(__dirname + '/public')); //Serves index.html
app.use(express.json()); //For parsing application/json
app.use(express.urlencoded({ extended: true })); //For parsing application/x-www-form-urlencoded

app.get('/curators/', async function (req, res) {
    var files = await getDirectoryNames('savedData');
    console.log(`File array to send to client: ${JSON.stringify(files)}`)
    res.json(files);
});

app.put('/curator/', async function (req, res) {
    //Get authorization code from req
    let auth = req.get('Authorization');

    //Get user's id
    const options0 = {
        method: 'GET',
        hostname: 'api.spotify.com',
        path: '/v1/me',
        headers: {
            'Authorization': auth
        }
    };
    try {
        var userObject = await makeRequest(options0);
    } catch (error) {
        console.error(error);
    }
    var userID = userObject.id;
    console.log(`userID = ${userID}`);

    //Create directory for user
    var userDataPath = savePathTemplate + userID + '/';
    await createDirectory(userDataPath);

    //Get IDs of all saved songs in a user's library
    const options = {
        method: 'GET',
        hostname: 'api.spotify.com',
        path: '/v1/me/tracks' + '?' + 'offset=0' + '&' + 'limit=50',
        headers: {
            'Authorization': auth
        },
    };
    const trimFunction = createTrimFunction([["track", "name"], ["track", "id"]]);
    try {
        var responseArray = await chainRequests(options, trimFunction); //Make promise handler?
    } catch (error) {
        console.error(error);
    };
    console.log(`responseArray = ${JSON.stringify(responseArray)}`);
    const idArray = responseArray.map(track => track["id"]);

    //Setup for requesting song feature data
    const options2 = {
        method: 'GET',
        hostname: 'api.spotify.com',
        path: '/v1/audio-features' + '/' + '?' + 'ids=', //Will receive ids from function
        headers: {
            'Authorization': auth
        },
    };
    const trimFunction2 = (response) => response["audio_features"].map(createTrimFunction(songFeatures));

    //Create an array of query strings
    var queryArray2 = createSubArrays(idArray, 100).map(subArray => subArray.join(','));
    console.log(`queryArray2 = ${JSON.stringify(queryArray2)}`);

    //Get song feature data
    try {
        var songFeatureArray = await concurrentRequests(options2, queryArray2, trimFunction2);
    } catch (error) {
        console.error(error);
    };
    const superFeatureArray = joinSubArrays(songFeatureArray);

    //Write song features and song ID JSON to text file
    var featurePromise = writeToFile(userDataPath + 'songFeatures.txt', JSON.stringify(superFeatureArray));
    var idPromise = writeToFile(userDataPath + 'songID.txt', JSON.stringify(idArray));
    await Promise.all([featurePromise, idPromise]).catch(error => { console.error(error); res.json(error) });

    //Run script to save songs 
    var result = await spawnPython('storeLibrary', [userDataPath]).catch(error => { console.error(error); res.json(error) });

    //Return new list of curators to client
    var files = await getDirectoryNames('savedData');
    console.log(`File array to send to client: ${JSON.stringify(files)}`)
    res.json(files);
});

app.get('/recommendation/:curator', async function (req, res) {
    //Check if curator data exists
    //TODO: Does not validate req.params.curator, is a security hazard
    var curatorDataPath = savePathTemplate + req.params.curator + '/';
    var pathExists = await checkPath(curatorDataPath);
    if (pathExists === false) req.json("Curator does not exist");

    //Get authorization code from req
    let auth = req.get('Authorization');

    //Get user's id
    const options0 = {
        method: 'GET',
        hostname: 'api.spotify.com',
        path: '/v1/me',
        headers: {
            'Authorization': auth
        }
    };
    try {
        var userObject = await makeRequest(options0);
    } catch (error) {
        console.error(error);
    }
    var userID = userObject.id;
    console.log(`userID = ${userID}`);

    //Check if new directory needs to be created for user. If true, must add song data temporarily. If false, skip
    var userDataPath = savePathTemplate + userID + '/';
    var createdNew = await createDirectory(userDataPath).catch(error => { console.error(error); res.json(error) });

    if (createdNew === true) {
        //User's path is now on temporary directory
        userDataPath = tempPathTemplate + userID + '/';

        //Get IDs of all saved songs in a user's library
        const options = {
            method: 'GET',
            hostname: 'api.spotify.com',
            path: '/v1/me/tracks' + '?' + 'offset=0' + '&' + 'limit=50',
            headers: {
                'Authorization': auth
            },
        };
        const trimFunction = createTrimFunction([["track", "name"], ["track", "id"]]);
        try {
            var responseArray = await chainRequests(options, trimFunction); //Make promise handler?
        } catch (error) {
            console.error(error);
        };
        console.log(`responseArray = ${JSON.stringify(responseArray)}`);
        const idArray = responseArray.map(track => track["id"]);

        //Setup for requesting song feature data
        const options2 = {
            method: 'GET',
            hostname: 'api.spotify.com',
            path: '/v1/audio-features' + '/' + '?' + 'ids=', //Will receive ids from function
            headers: {
                'Authorization': auth
            },
        };
        const trimFunction2 = (response) => response["audio_features"].map(createTrimFunction(songFeatures));

        //Create an array of query strings
        var queryArray2 = createSubArrays(idArray, 100).map(subArray => subArray.join(','));
        console.log(`queryArray2 = ${JSON.stringify(queryArray2)}`);

        //Get song feature data
        try {
            var songFeatureArray = await concurrentRequests(options2, queryArray2, trimFunction2);
        } catch (error) {
            console.error(error);
        };
        const superFeatureArray = joinSubArrays(songFeatureArray);

        //Write song features and song ID JSON to text file
        var featurePromise = writeToFile(userDataPath + 'songFeatures.txt', JSON.stringify(superFeatureArray));
        var idPromise = writeToFile(userDataPath + 'songID.txt', JSON.stringify(idArray));
        await Promise.all([featurePromise, idPromise]).catch(error => { console.error(error); res.json(error) });

        //Run script to save songs 
        await spawnPython('storeLibrary', [userDataPath]).catch(error => { console.error(error); res.json(error) });
    }

    //Run script to get recommended songs
    const maxRecs = 20;
    var recDataPath = await spawnPython('recommendSongs', [curatorDataPath, userDataPath, maxRecs]).catch(error => { console.error(error); res.json(error) });

    //Read recommendation data
    var recData = await readFromFile(recDataPath);

    //Return result to client
    var jsonData = JSON.parse(recData);
    console.log(`Sending result to client: ${JSON.stringify(jsonData)}`);
    res.json(jsonData);
});

app.post('/', function (req, res) {
    let auth = req.get('Authorization');

    //Stringifying JSON
    var testJson = { "auth": auth };
    var stringJson = JSON.stringify(testJson);

    //Spawn python to perform task
    spawnPython('test', [stringJson])
        .then(result => {
            console.log(`Sent to server: ${result}`);
            res.json(result);
        })
        .catch(err => { console.log(`ERROR WITH PROMISE: ${err}`); res.json(err); });
});

console.log('Listening on 8888');
app.listen(8888);

