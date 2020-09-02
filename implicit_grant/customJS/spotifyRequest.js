const webRequest = require('./webRequest.js');
const trimJSON = require('./trimJSON.js');

async function userProfile(auth) {
    const options = {
        method: 'GET',
        hostname: 'api.spotify.com',
        path: '/v1/me',
        headers: {
            'Authorization': auth
        }
    };

    try {
        let userObject = await webRequest.makeRequest(options);
        return userObject;
    } catch (err) {
        console.error(`Error in making request for user ID:: ${err}`);
        throw err;
    }
};
exports.userProfile = userProfile;

async function userSavedTracks(auth, trimFunction, maxTracks) {
    const tracksPerRequest = 50;
    const options = {
        method: 'GET',
        hostname: 'api.spotify.com',
        path: '/v1/me/tracks' + '?' + 'offset=0' + '&' + 'limit=' + tracksPerRequest,
        headers: {
            'Authorization': auth
        }
    };
    let songArray = await webRequest.chainRequests(options, trimFunction, maxTracks / tracksPerRequest);
    return songArray;
};
exports.userSavedTracks = userSavedTracks;

async function severalTrackFeatures(auth, trimFunction, trackIDs) {
    const idsPerRequest = 100;
    const options = {
        method: 'GET',
        hostname: 'api.spotify.com',
        path: '/v1/audio-features' + '/' + '?' + 'ids=', //Will receive ids from function
        headers: {
            'Authorization': auth
        },
    };
    let queries = trimJSON.createSubArrays(trackIDs, idsPerRequest).map(subArray => subArray.join(','));
    let trackFeatures = await webRequest.concurrentRequests(options, queries, trimFunction);
    return trackFeatures;
};
exports.severalTrackFeatures = severalTrackFeatures;