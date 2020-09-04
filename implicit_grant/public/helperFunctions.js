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

    var recommendSource = document.getElementById('recommend_template').innerHTML,
        recommendTemplate = Handlebars.compile(recommendSource),
        recommendPlaceholder = document.getElementById('recommend');

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

            //Requests Spotify for all of the albums saved by the User
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

                    //Add available curators as options in select object
                    limeRequest.getCurators((response) => {
                        options = response.map(curator => ({ value: curator.id, display: curator.displayName }));
                        limeUtility.fillSelect('#curatorSelect', options);
                    });

                    //Loop to add rest of user's albums
                    let userAlbumOptions = {
                        url: response.next,
                        headers: { 'Authorization': 'Bearer ' + access_token },
                        success: function (response) {
                            albumLibraryPlaceholder.innerHTML += albumLibraryTemplate(response);
                            if (response.next == null) return;
                            else {
                                userAlbumOptions.url = response.next;
                                $.ajax(userAlbumOptions);
                            }
                        }
                    };
                    $.ajax(userAlbumOptions);
                }
            });

            //On submit event handler
            $('#recommendation-form').submit(event => {
                event.preventDefault();

                let selectedOption = $('#curatorSelect').val();
                console.log(JSON.stringify(selectedOption));

                if (selectedOption === 'addCurator') {
                    limeRequest.putCurator(access_token, (response) => {
                        $('#curatorSelect').empty();
                        options = response.map(curator => ({ value: curator.id, display: curator.displayName }));
                        limeUtility.fillSelect('#curatorSelect', options);
                    });
                }
                else {
                    limeRequest.getRecommendation(access_token, selectedOption, (response) => {
                        let trackIDs = response.map((object) => object.id);
                        let accessibilityScores = response.map((object) => object.accessibility);

                        $.ajax({
                            url: 'https://api.spotify.com/v1/tracks',
                            headers: {
                                'Authorization': 'Bearer ' + access_token
                            },
                            data: {
                                'ids': trackIDs.join(',')
                            },
                            success: function (response) {
                                response = response.tracks.map((object, index) => { object.accessibility = accessibilityScores[index]; return object; });
                                recommendPlaceholder.innerHTML = recommendTemplate({ 'items': response }) + '<hr />';
                            }
                        });
                    });
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