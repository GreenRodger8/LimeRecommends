//Custom request functions

const https = require('https');

/**
 * Create a connection to make a request. Response is returned as JSON
 * @param   {JSON} options Options for https request
 * @param   {Function} onEnd Function performed on complete string response
 * @returns {Promise} Resolves to final JSON response
 */
function makeRequest(options) {
    return new Promise((resolve, reject) => {
        console.log(`Starting connection to \"${options.hostname}${options.path}\"`);

        //Create connection
        var stringResponse = "";
        const connection = https.request(options, (connectionRes) => {

            //Gather response chunks into string
            connectionRes.setEncoding('utf8');
            connectionRes.on('data', (chunk) => {
                stringResponse += chunk;
            });
            connectionRes.on('error', (err) => {
                console.error(`Request to \"${options.hostname}${options.path}\" returned an error: ${err}`);
                reject(err);
            });

            //Return final response
            connectionRes.on('end', () => {
                var responseObject = JSON.parse(stringResponse);
                console.log(`Final response object from \"${options.hostname}${options.path}\" is finished`);
                resolve(responseObject);
            });

        });

        connection.on('error', (e) => {
            console.error(`Connection to \"${options.hostname}${options.path}\" resulted in error: ${e.message}`);
            reject(e);
        });

        //Close Request
        connection.end();
    });
};
exports.makeRequest = makeRequest;

/**
 * Adds a new domain and path to an already existing object of options
 * @param {JSON} initialOptions Options object to be modifed
 * @param {String} url String used to derive new domain and path
 * @returns {JSON}
 */
function newPath(initialOptions, url) {
    var match, regExp = /^https?:\/\/([^&;=\/]+)(\/[^;]*)$/g;

    match = regExp.exec(url);
    initialOptions.hostname = match[1];
    initialOptions.path = match[2];

    console.log(`initialOptions stringifyied ${JSON.stringify(initialOptions)}`)
    return initialOptions;
};
exports.newPath = newPath;

/**
 * Chain requests to get all of an endpoints data
 * @param {JSON} initialOptions Options to use for request
 * @param {Function} filterFunction Decides what to keep from response["items"] object
 * @returns {Array} Array of objects composed from chained requests
 */
async function chainRequests(initialOptions, filterFunction) {
    var response = await makeRequest(initialOptions);
    var responseArray = response["items"].map(filterFunction); //Must return only id from {track: {id}}?

    while (response.next) {
        response = await makeRequest(newPath(initialOptions, response.next));
        responseArray = responseArray.concat(response["items"].map(filterFunction));
    }

    return responseArray;
};
exports.chainRequests = chainRequests;

/**
 * Make multiple requests at the same time
 * @param {JSON} options Request options to use as a template when making requests
 * @param {Array} queryArray Provides string querys for requests
 * @param {Function} filterFunction Decides what to keep from response object
 * @returns {Promise} Resolves into an array with the result of each request
 */
function concurrentRequests(options, queryArray, filterFunction) {
    var requestArray = [];

    for (queryString of queryArray) {
        //Reset tempOptions to accept a new queryString
        var tempOptions = Object.assign({}, options);

        //Add query string to path
        console.log(`A queryString ${queryString}`);
        tempOptions.path += queryString;

        requestArray.push(makeRequest(tempOptions).then(filterFunction));
    }
    return Promise.all(requestArray);
};
exports.concurrentRequests = concurrentRequests;