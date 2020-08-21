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

    /**
    * Used to recursively generate AJAX calls till an error occurs or successFunc returns null
    * Result of successFunc is used as new URL
    * @param  {string} url The url to use for the request
    * @param  {JSON} headers The headers to use for the request
    * @param  {function} successFunc The function to call on success. Gets passed the response object
    * @return nothing
    */
    function loopAjax(url, headers, successFunc) {
        $.ajax({
            url: url,
            headers: headers,
            success: function (response) {
                var result = successFunc(response);
                if (result == null) return;
                else {
                    loopAjax(result, headers, successFunc);
                }
            }
        });
    }

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
                    $.ajax({
                        type: "GET",
                        url: '/curators/',
                        success: function (response) {
                            console.log(JSON.stringify(response));
                            for (curator of response) {
                                htmlOption = '<option value=' + '\"' + curator.id + '\"> ' + curator.displayName + '</option>';
                                $('#curatorSelect').append(htmlOption);
                            }
                        }
                    });

                    loopAjax(response.next, { 'Authorization': 'Bearer ' + access_token }, (response) => {
                        albumLibraryPlaceholder.innerHTML += albumLibraryTemplate(response);
                        return response.next;
                    });
                }
            });

            //Code for submission form
            $('#recommendation-form').submit(event => {
                event.preventDefault();

                var selectedOption = $('#curatorSelect').val();
                console.log(JSON.stringify(selectedOption));

                if (selectedOption === 'addCurator') {
                    console.log(`Chose to add curator`);
                    $.ajax({
                        type: "PUT",
                        url: '/curator/',
                        headers: {
                            'Authorization': 'Bearer ' + access_token
                        },
                        data: {},
                        success: function (response) {
                            console.log(JSON.stringify(response));
                            $('#curatorSelect').empty();
                            for (curator of response) {
                                htmlOption = '<option value=' + '\"' + curator.id + '\"> ' + curator.displayName + '</option>';
                                $('#curatorSelect').append(htmlOption);
                            }
                        }
                    });
                }
                else {
                    console.log(`Chose the curator: ${selectedOption}`);
                    $.ajax({
                        type: "GET",
                        url: '/recommendation/' + selectedOption,
                        headers: {
                            'Authorization': 'Bearer ' + access_token
                        },
                        dataType: "json",
                        success: function (response) {
                            //recommendPlaceholder.innerHTML = recommendTemplate(response);
                            idArray = response.map((object) => object.id);
                            accessibilityArray = response.map((object) => object.accessibility);
                            console.log(idArray);

                            $.ajax({
                                url: 'https://api.spotify.com/v1/tracks',
                                headers: {
                                    'Authorization': 'Bearer ' + access_token
                                },
                                data: {
                                    'ids': idArray.join(',')
                                },
                                success: function (response) {
                                    response = response.tracks.map((object, index) => { object.accessibility = accessibilityArray[index]; return object; });
                                    console.log(response);
                                    recommendPlaceholder.innerHTML = recommendTemplate({ 'items': response });
                                }
                            });
                        }
                    });
                }

            });

            //Requests own server to save user song data
            /*$.ajax({
                type: "PUT",
                url: '/curator/',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                data: {},
                success: function (response) {
                    centroidPlaceholder.innerHTML = centroidTemplate(response);
                }
            });*/

            //Requests own server for user song recommendations
            /*$.ajax({
                type: "GET",
                url: '/recommendation/' + 'crazywanderinghost',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                dataType: "json",
                success: function (response) {
                    //recommendPlaceholder.innerHTML = recommendTemplate(response);
                    idArray = response.map((object) => object.id);
                    accessibilityArray = response.map((object) => object.accessibility);
                    console.log(idArray);

                    $.ajax({
                        url: 'https://api.spotify.com/v1/tracks',
                        headers: {
                            'Authorization': 'Bearer ' + access_token
                        },
                        data: {
                            'ids': idArray.join(',')
                        },
                        success: function (response) {
                            response = response.tracks.map((object, index) => { object.accessibility = accessibilityArray[index]; return object; });
                            console.log(response);
                            recommendPlaceholder.innerHTML = recommendTemplate({ 'items': response });
                        }
                    });
                }
            });*/

            //Requests own server to process data
            //$.ajax({
            //    type: "GET",
            //    url: '/',
            //    headers: {
            //        'Authorization': 'Bearer ' + access_token
            //    },
            //    data: {},
            //    success: function (response) {
            //        testPlaceholder.innerHTML = testTemplate(response);
            //    }
            //});

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