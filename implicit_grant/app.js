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
const { chainRequests, concurrentRequests } = require('./customJS/webRequest.js');
const { spawnPython } = require('./customJS/python.js');
const { createTrimFunction, createSubArrays, joinSubArrays } = require('./customJS/trimJSON.js');
const { writeToFile, readFromFile} = require('./customJS/ioStream.js')

//  Express server section
var app = express();

app.use(express.static(__dirname + '/public')); //Serves index.html
app.use(express.json()); //For parsing application/json
app.use(express.urlencoded({ extended: true })); //For parsing application/x-www-form-urlencoded

app.put('/centroid/', async function (req, res) {
    //Get authorization code from req
    let auth = req.get('Authorization')

    //Get all of the saved songs in the user's library
    const options = {
        method: 'GET',
        hostname: 'api.spotify.com',
        path: '/v1/me/tracks' + '?' + 'offset=0' + '&' + 'limit=50',
        headers: {
            'Authorization': auth
        },
    };
    var trimFunction = createTrimFunction([["track", "name"], ["track", "id"]]);
    try {
        var responseArray = await chainRequests(options, trimFunction); //Make promise handler?
    } catch (error) {
        console.error(error);
    };
    console.log(`responseArray = ${JSON.stringify(responseArray)}`);

    //Setup for requesting song feature data
    const options2 = {
        method: 'GET',
        hostname: 'api.spotify.com',
        path: '/v1/audio-features' + '/' + '?' + 'ids=', //Will receive ids from function
        headers: {
            'Authorization': auth
        },
    };
    const songFeatures = ["acousticness", "danceability", "energy", "instrumentalness", "loudness", "speechiness", "tempo", "valence"]; //Store where?
    const trimFunction2 = (response) => response["audio_features"].map(createTrimFunction(songFeatures));

    //Create an array of query strings
    var queryArray2 = responseArray.map(track => track["id"]);
    queryArray2 = createSubArrays(queryArray2, 100);
    queryArray2 = queryArray2.map(subArray => subArray.join(','));
    console.log(`queryArray2 = ${JSON.stringify(queryArray2)}`);

    //Get song feature data
    try {
        var songFeatureArray = await concurrentRequests(options2, queryArray2, trimFunction2);
    } catch (error) {
        console.error(error);
    };

    //Run song features through python script
    var superFeatureArray = joinSubArrays(songFeatureArray);
    var path = "./songFeatures.txt";
    await writeToFile(path, JSON.stringify(superFeatureArray)).catch(error => { console.error(error); res.json(error) });
    var pythonResult = await spawnPython('createCentroid', [path]);

    var centroid = await readFromFile(pythonResult).catch(error => { console.error(error); res.json(error) });

    //Return result to client
    console.log(`Sending result to client: ${centroid}`);
    res.json(centroid);
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

