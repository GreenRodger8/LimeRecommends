/**
 * This is an example of a basic node.js script that performs
 * the Implicit Grant oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#implicit_grant_flow
 */

var express = require('express');
var https = require('https');

const { spawn } = require('child_process');

//  Express server section
var app = express();

app.use(express.static(__dirname + '/public')); //Serves index.html
app.use(express.json()); //For parsing application/json
app.use(express.urlencoded({ extended: true })); //For parsing application/x-www-form-urlencoded

/**
 * Spawn python to perform task
 * @param   {Array} arguments Array of arguments
 * @param   {String} pythonName Name of script to spawn
 * @returns {Promise} Resolves to final result of python script or error
 */
function spawnPython(pythonName, arguments) {
    return new Promise((resolve, reject) => {
        const python = spawn('python.exe', [pythonName + '.py', ...arguments]);
        var pythonResult;
        python.stdout.on('data', (data) => {
            pythonResult = data.toString();
            console.log(`Python script ${pythonName}.py returned data: ${pythonResult}`);
        });
        python.stderr.on('data', (data) => {
            console.log(`Python script ${pythonName}.py stderr: ${data}`);
            reject(data);
        });
        python.on('exit', (code) => {
            console.log(`Python script ${pythonName}.py exited with code: ${code}`);
            resolve(pythonResult);
        });
    });
};

/**
 * Creates a filter function that will only keep certain key/value pairs
 * @param   {JSON} oldJson JSON Object to trim 
 * @param   {Array} keys Keys to keep from oldJSON 
 *                       If a key is an array then the first value of the array is used as the key,
 *                       the rest of the array is then treated as a nested JSON and recursed
 * @returns {Function} Function that filters JSON objects passed to it
 */
function createJSONFilter(keys) {
    return function trimJSON(oldJson) {
        var newJson = {};
        for (let key of keys) {
            if (typeof key === 'string') newJson[key] = oldJson[key];
            else if (typeof key === 'object' && Array.isArray(key)) {
                var recurseFilter = createJSONFilter(key.slice(1));
                newJson[key[0]] = recurseFilter(oldJson[key[0]]);
            }
        }
        return newJson;
    };
}

app.put('/centroid', function (req, res) {
    //Get authorization from req
    let auth = req.get('Authorization');

    //Options for Spotify API request
    const options = {
        method: 'GET',
        hostname: 'api.spotify.com',
        path: '/v1/me/tracks' + '?' + 'offset=0' + '&' + 'limit=50',
        headers: {
            'Authorization': auth
        },
    };

    //Make request to Spotify API
    var stringResponse = "";
    const connection = https.request(options, (connectionRes) => {

        //Gather response chunks into string
        connectionRes.setEncoding('utf8');
        connectionRes.on('data', (chunk) => {
            stringResponse += chunk;
        });
        connectionRes.on('error', (err) => {
            console.error(`Error while trying to get response in PUT /centroid router: ${err}`);
        });

        //Spawn python script and pass response string to it at end of stream
        connectionRes.on('end', () => {
            //Trims received data
            var jsonResponse = JSON.parse(stringResponse);
            var jsonFilter = createJSONFilter([["track", "name", "id"]]);
            var filteredResponse = jsonResponse["items"].map(jsonFilter);
            var stringArgument = JSON.stringify(filteredResponse);

            //Run python script on received data
            spawnPython('test2', [stringArgument])
                .then(result => {
                    console.log(`Sent to client: ${result}`);
                    res.json(result);
                })
                .catch(err => { console.log(`ERROR WITH PROMISE: ${err}`); res.json(err); });

            //res.json(JSON.stringify(stringArgument));
        });

    });

    connection.on('error', (e) => {
        console.error(`PROBLEM WITH REQUEST: ${e.message}`);
    });

    //Close Request
    connection.end();
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
