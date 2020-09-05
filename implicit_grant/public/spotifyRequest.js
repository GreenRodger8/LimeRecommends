// JavaScript source code

spotifyRequest = (function () {
    let spotifyRequest = {};

    spotifyRequest.createPlaylist = function createPlaylist(access_token, userID, data, onSuccess) {
        $.ajax({
            type: 'POST',
            url: 'https://api.spotify.com/v1/users/' + userID + '/playlists',
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json'
            },
            data: data,
            success: onSuccess
        });
    };

    spotifyRequest.addToPlaylist = function addToPlaylist(access_token, playlistID, data, onSuccess) {
        $.ajax({
            type: 'POST',
            url: 'https://api.spotify.com/v1/playlists/' + playlistID + '/tracks',
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json'
            },
            data: data,
            success: onSuccess
        });
    };

    return spotifyRequest;
})();
