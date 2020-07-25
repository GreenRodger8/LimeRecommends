/**
 * This is an example of a basic node.js script that performs
 * the Implicit Grant oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#implicit_grant_flow
 */

var express = require('express');
const { spawn } = require('child_process');

//  Express server section
var app = express();

app.use(express.static(__dirname + '/public')); //Serves index.html
app.use(express.json()); //For parsing application/json
app.use(express.urlencoded({ extended: true })); //For parsing application/x-www-form-urlencoded

app.post('/', function (req, res) {
    let auth = req.get('Authorization');

    //Stringifying JSON
    var testJson = { "auth": auth };
    var stringJson = JSON.stringify(testJson);

    //Spawn python to perform task
    const python = spawn('python.exe', ['test.py', stringJson]); 
    python.stdout.on('data', (data) => {
        var pythonResult = data.toString();

        //Print response from Python script and returns it to webpage
        console.log(pythonResult);
        res.json(pythonResult);
    });
    python.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
    });

    
    //console.log("Reached bottom of routing function");
    //res.json("Reached bottom of routing function");
});

console.log('Listening on 8888');
app.listen(8888);
