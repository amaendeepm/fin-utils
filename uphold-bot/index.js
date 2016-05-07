
var RtmClient = require('@slack/client').RtmClient;
var MemoryDataStore = require('@slack/client').MemoryDataStore;
var token = process.env.SLACK_API_TOKEN || 'xoxb-41004246658-nbaXY4D83JvEz68zBHYi8bmQ';
var rtm = new RtmClient(token, {logLevel: 'info',dataStore: new MemoryDataStore(), autoReconnect: true});
rtm.start();

//Now start listening for evernts
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

var channels =[], users = [];
var commands =['list cards','get ticker'];

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {

    channels = rtmStartData.channels;
    users = rtmStartData.users;
    console.log("Connected to team " + rtmStartData.team.name + "...", users);
});

var upholdConfig={
        "host": "api-sandbox.uphold.com",
        "key": "e6278a26ca586ffaf79440559aade7e04dcbb6c6",
        "secret": "9b6aac27a903b7fa9381797ee42e05a4ef48f621",
        "scope": "accounts:read,cards:read,cards:write,contacts:read,contacts:write,transactions:deposit,transactions:read,transactions:transfer:application,transactions:transfer:others,transactions:transfer:self,transactions:withdraw,user:read",
        "bearer": "ed28779c989bfa1125be2ea13b3a04b8db0bb3de"};
var Uphold = require('uphold-sdk-node')(upholdConfig);
//console.log(Uphold);

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
  // Listens to all `message` events from the team
    
var channel  = message.channel;
    
  console.log("Received: " + message.text + " from " + message.user);
 console.log("user ..", message._client);
  if(commands.indexOf(message.text) == -1) {
        rtm.sendMessage('Sorry I did not recognize it. Valid commands are only 2. ' , channel, function messageSent() {
            console.log("sent the reply of valid commands");
        });
  } else {
      //As of now just check with if-else
      
      if(message.text === "get ticker") {
          //Now call Uphold API to get all tickers
         Uphold.tickers(function(err, tickers) {
                console.log(tickers);
                // Return in slack bot the returned ticker values
                rtm.sendMessage(JSON.stringify(tickers) , channel, function messageSent() {
                    console.log("Sent the Ticker values back");
                });
         }); 
      } else if(message.text === "list cards"){
         
          var total = 0;
         Uphold.cards(function(err, cards) {
                console.log(cards.length);
                total = cards.length;
                // Return in slack bot the returned ticker values
//                rtm.sendMessage(JSON.stringify(cards) , channel, function messageSent() {
//                            console.log("Sending back list of cards");
//                  });
         });
          
         Uphold.card('640cfd52-c5b2-4759-b0cc-08fd47fe76e5',function(err, card) {
                  rtm.sendMessage( "Total of " + total + "cards. Latest is: "+ JSON.stringify(card) , channel, function messageSent() {
                            console.log("Sending back details of latest card");
                  });  
         });

      }
  }
  
});

rtm.on(RTM_EVENTS.CHANNEL_CREATED, function (message) {
  // Listens to all `channel_created` events from the team
});



Uphold.createCard("Ernit Card-007", "DKK", function(err, card) {
    console.log("Card creation Error: " , err);
    console.log("Card created: " , card);
});

//Uphold.cards(function(err, cards) {
//    console.log("You have " + cards.length + " cards with Uphold now");
//});
//
//Uphold.tickersForCurrency('INR', function(err, tickers) {
//    console.log(tickers);
//});
//
//Uphold.tickers(function(err, tickers) {
//    console.log(tickers);
//});