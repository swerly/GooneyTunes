# GooneyTunes
Bot for discord


## Setting up
0. Make sure npm / node are setup
1. Clone repository
2. Open powershell / cmd in the root folder and run `npm i`
3. Create a `settings.json` file in the `app` folder
4. Fill out `settings.json` with discord and spotify info like so:

```
{
  "discordToken": "discord_bot_token",
  "spotifyClientId": "spotify_client_id",
  "spotifyClientSecret": "spotify_client_secret",
  "spotifyRedirectUri": "spotify_redirect_uri"
}
```

## Running
1. Open powershell / cmd in the root folder and run `node index.js`
  1.a Make sure console output says `Listening on 8888`
2. Open web browser and go to `localhost:8888`
3. Follow instructions to login to spotify
