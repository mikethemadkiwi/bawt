# Madkiwi's Twitch Bawt
### Easy Local Twitch bot with Overlays.  
  
1. Confirm 'twitch' database setup using sql provided.  
2. edit the example config files to match twitch app and database details.  
3. rename `exampleconfig` folder to `config`  
4. go into each service folder  
5. npm install ( cos dey all has different dependancies. )  
6. run using `node index.js` ( each service uses this filename ) 
  
Services best run using "nodemon" in a screen session or other persistance service.  
Run twitchauth service FIRST as ALL services run thru it's socket.  