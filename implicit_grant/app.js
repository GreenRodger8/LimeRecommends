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

//  Python script section
const python = spawn('python.exe', ['hello_world.py']);

python.stdout.on('data', (data) => {
    console.log(data.toString());
});

python.on('exit', (code) => {
    console.log(`Child exited with code ${code}`);
});

//  Express server section
var app = express();

app.use(express.static(__dirname + '/public')); // serves index.html
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/', function (req, res) {
    var auth = req.get('Authorization');

    console.log(auth);
    res.json(auth)
});

console.log('Listening on 8888');
app.listen(8888);
