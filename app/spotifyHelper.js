var settings = require('./settings');
var spotifyUri = require('spotify-uri');
var request = require('request'); // "Request" library

var spotifyHelper = {};

var clientId = settings.spotifyClientId; // Your client id
var clientSecret = settings.spotifyClientSecret; // Your secret

var refreshToken;
var currentToken;
var tokenExpiryTime;
var trackAddCallback;

var gooneyTunesPlaylistId = '44hZNKAIEvDHxp3I2HCDSD';

spotifyHelper.setTokenData = function(tokens){
    setTokenData(tokens);
};

spotifyHelper.handleSpotifyUrl = function(url){
    var urlObj = spotifyUri.parse(url);
    handleUrlObj(urlObj);
};

spotifyHelper.setTrackAddCallback = function(callback){
    trackAddCallback = callback;
};


// =================================================================
function setTokenData(tokens){
    refreshToken = tokens.refresh_token;
    currentToken = tokens.access_token;
    tokenExpiryTime = getExpiryTimeForToken(tokens.expires_in);
}

function getExpiryTimeForToken(tokenLife){
    return (new Date).getTime() + tokenLife;
}

// never tested this function to see if it works, but it should (and probably doesnt anyway) :)
function updateTokenIfNecessary() {
    if((new Date).getTime() > tokenExpiryTime){
        requestNewTokens();
    }
}

function requestNewTokens(){
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            setTokenData(body);
        }
    });
}

function handleUrlObj(obj){
    if (obj.type === 'track'){
        addTrackToPlaylist(obj.id);
    }
}

function addTrackToPlaylist(trackId){
    // should probably test the token update :)
    updateTokenIfNecessary();

    var options = {
        url: 'https://api.spotify.com/v1/users/seth.werly/playlists/' + gooneyTunesPlaylistId + '/tracks?uris=spotify%3Atrack%3A' + trackId,
        headers: { 'Authorization': 'Bearer ' + currentToken },
        json: true
    };

    // use the access token to access the Spotify Web API
    request.post(options, function(error, response, body) {
        var statusCodeSuccess = response.statusCode === 201;

        startTrackAddCallback(statusCodeSuccess, trackId);
    });
}

function startTrackAddCallback(statusCodeSuccess, trackId){
    if (!trackAddCallback){
        throw 'You must use "setTrackAddCallback()" to set a callback function to handle the result of adding a track.';
    }

    var options = {
        url: 'https://api.spotify.com/v1/tracks/' + trackId,
        headers: { 'Authorization': 'Bearer ' + currentToken },
        json: true
    };

    // make a get request to get the song name of the track that was just added
    request.get(options, function(error, response, body) {
        try {
            var songTitle = statusCodeSuccess ? body.name : '';
        } catch (e){
            console.log(JSON.stringify(response) + '\n\n\n' + body);
        }

        // finally give control back to calling function
        trackAddCallback(statusCodeSuccess, songTitle);
    });
}

module.exports = spotifyHelper;