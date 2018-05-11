var spotifyHelper = require('./spotifyHelper');
var Discord = require('discord.js');
var settings = require('./settings');

var botRunner = {};
var discordBot;
var currentChannel;

var botPrefix = '`';

botRunner.initializeBotWithSpotifyTokens = function(tokens){
    startDiscordBot();
    setupSpotifyHelper(tokens);
};

function startDiscordBot(){
    discordBot = new Discord.Client();

    discordBot.on('ready', function(){
        console.log('Discord Bot Ready');
    });

    discordBot.on('message', function(message){
        handleDiscordMessage(message);
    });

    discordBot.login(settings.discordToken);
}

function setupSpotifyHelper(tokens){
    spotifyHelper.setTokenData(tokens);
    spotifyHelper.setTrackAddCallback(addTrackCallback);
}

function handleDiscordMessage(message){
    if (!validMessageForBot(message)){
        //console.log('not valid message for bot');
        return;
    }

    currentChannel = message.channel;
    var content = message.content;

    if (isBotFunction(content)){
        handleBotFunction(content.substr(1));
    } else if (isSpotifyMessage(content)){
        spotifyHelper.handleSpotifyUrl(content);
    }
}

function validMessageForBot(message){
    // gotta make sure ACTUAL GOOD MUSIC is added to the playlist ;)
    return isValidChannel(message.channel.name) && notElliotPosting(message);
}

function isValidChannel(name){
    return name == 'gooney-tunes' || name == 'bot_test';
}

function isBotFunction(message){
    return message.startsWith(botPrefix);
}

function isSpotifyMessage(message){
    return message.indexOf('spotify.com') !== -1;
}

// lul got em
function notElliotPosting(message){
    var tag = message.author.tag;
    var channel = message.channel;
    var content = message.content;

    if (tag === 'Bluesmith#9784' && isSpotifyMessage(content)) {
        channel.send('Something went wrong...');
        return false;
    }

    return true;
}

function handleBotFunction(functionStr){
    console.log('handleBotFunction: "' + functionStr + '"');

    switch (functionStr){
        case 'scan':
            scanMessages();
            break;

        default:
            console.log('invalid bot command' + functionStr);
    }
}

function scanMessages(){
    console.log('scanning messages...');

    var channel = discordBot.channels.find('name', 'gooney-tunes');
    
    channel.fetchMessages({limit : 2})
        .then((messages) => {
            messagesWereFetched(messages);
        })
        .catch(console.error);
}

var messagesWereFetched = function(messages){
    console.log('messages were fetched: ' + messages.size);

    var messageArray = messages.array();

    // uncomment log message above to see array contents in console
    //console.log(messageArray);

    // TODO: fix this loop
    // can't loop through messages array because its in some weird format that i dont want to look into
    /*
    for (var i = 0; i < messageArray; i++){
        var currentMessage = messageArray[i];

        if (isSpotifyMessage(message.content)){
            spotifyHelper.handleSpotifyUrl(message.content, null);
        }
    }*/
};

var addTrackCallback = function(statusCodeSuccess, trackName){
    console.log('addTrackCallback');

    if (statusCodeSuccess){
        var playlistUrl = 'https://open.spotify.com/user/seth.werly/playlist/44hZNKAIEvDHxp3I2HCDSD?si=Fw7l2KklSX6ITWE0_xLMUQ';
        currentChannel.send('Successfully added ' + trackName +' to GooneyTunes!\n\n' + playlistUrl);
    } else {
        currentChannel.send('Something went wrong...');
    }
};

module.exports = botRunner;