// JavaScript source code
(function () {

    var stateKey = 'spotify_auth_state';

    /**
    * Obtains parameters from the hash of the URL
    * @return Object
    */
    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    /**
    * Generates a random string containing numbers and letters
    * @param  {number} length The length of the string
    * @return {string} The generated string
    */
    function generateRandomString(length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    //var userProfileSource = document.getElementById('user-profile-template').innerHTML,
    //    userProfileTemplate = Handlebars.compile(userProfileSource),
    //    userProfilePlaceholder = document.getElementById('user-profile');

    var testSource = document.getElementById('test_template').innerHTML,
        testTemplate = Handlebars.compile(testSource),
        testPlaceholder = document.getElementById('test');

    var albumLibrarySource = document.getElementById('album_library_template').innerHTML,
        albumLibraryTemplate = Handlebars.compile(albumLibrarySource),
        albumLibraryPlaceholder = document.getElementById('album_library');

    var params = getHashParams();

    var access_token = params.access_token,
        state = params.state,
        storedState = localStorage.getItem(stateKey);

    if (access_token && (state == null || state !== storedState)) {
        alert('There was an error during the authentication');
    } else {
        localStorage.removeItem(stateKey);
        if (access_token) {

            //Requests Spotify for the last 50 albums saved by the User
            $.ajax({
                url: 'https://api.spotify.com/v1/me/albums',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                data: {
                    'limit': '50'
                },
                success: function (response) {
                    albumLibraryPlaceholder.innerHTML = albumLibraryTemplate(response);

                    $('#login').hide();
                    $('#loggedin').show();
                }
            });

            //Requests own server to process data
            $.ajax({
                type: "POST",
                url: '/',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                data: {},
                success: function (response) {
                    testPlaceholder.innerHTML = testTemplate(response);
                }
            });

        } else {
            $('#login').show();
            $('#loggedin').hide();
        }

        //Login-button sends user to Spotify login to retrieve access_token
        document.getElementById('login-button').addEventListener('click', function () {

            var client_id = window.client_id; // Your client id
            var redirect_uri = window.redirect_uri; // Your redirect uri

            var state = generateRandomString(16);

            localStorage.setItem(stateKey, state);
            var scope = 'user-library-read';

            var url = 'https://accounts.spotify.com/authorize';
            url += '?response_type=token';
            url += '&client_id=' + encodeURIComponent(client_id);
            url += '&scope=' + encodeURIComponent(scope);
            url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
            url += '&state=' + encodeURIComponent(state);

            window.location = url;
        }, false);
    }
})();