var express = require('express');
var session = require('express-session')
var util = require('util');
var oauth = require('oauth');
var path = require('path');

var app = express();
var bodyParser = require('body-parser');

// After registering @ https://apisandbox.openbankproject.com/consumer-registration
var _openbankConsumerKey = "jiaxhz1ooptadnxkch4hciy5lqnvw1krsxme1gth";
var _openbankConsumerSecret = "ugeb3dpe10t4likzo3xsuoimn3fr20wxizpwq0fn";

var base_url = 'https://apisandbox.openbankproject.com';
var consumer = new oauth.OAuth(
  base_url + '/oauth/initiate',
  base_url + '/oauth/token',
  _openbankConsumerKey,
  _openbankConsumerSecret,
  '1.0',                             //rfc oauth 1.0, includes 1.0a
  'http://127.0.0.1:8089/callback',
  'HMAC-SHA1');

var cookieParser = require('cookie-parser');
app.use(session({
  secret: "very secret",
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser());


app.get('/connect', function(req, res){
  consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
      res.status(500).send("Error getting OAuth request token : " + util.inspect(error));
    } else {
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect(base_url + "/oauth/authorize?oauth_token="+req.session.oauthRequestToken);
    }
  });
});


app.get('/callback', function(req, res){
  consumer.getOAuthAccessToken(
    req.session.oauthRequestToken,
    req.session.oauthRequestTokenSecret,
    req.query.oauth_verifier,
    function(error, oauthAccessToken, oauthAccessTokenSecret, result) {
      if (error) {
        //oauthAccessToken, -Secret and result are now undefined
        res.status(500).send("Error getting OAuth access token : " + util.inspect(error));
      } else {
        //error is now undefined
        req.session.oauthAccessToken = oauthAccessToken;
        req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
        console.log("access token= ",oauthAccessToken);
          
        res.redirect('/signed_in');
      }
    }
  );
});


app.get('/signed_in', function(req, res){
  res.status(200).send('Signed in by OAuth Successfully. <br><a href="/getaccounts">Get Accounts </a><br><a href="javascript:alert("Creation of New Account Not Possible using OpenBank API yet! ;-)")">Create a new Account </a><br><a href="/transferoptions">Transfer Funds</a>')
});


app.get('/transferoptions', function(req,res){
     var html = '<form action="/doTransfer" method="post">' +
               'Enter amount to transfer in Ernit-1:' +
               '<input type="number" name="ernit1" />' +
         
               '<br><br>' +
         
               'Enter amount to transfer in Ernit-2:' +
               '<input type="number" name="ernit2" />' +
         
               '<br>' +
               '<button type="submit">Transfer</button>' +
            '</form>';
  res.send(html);
});

app.post('/doTransfer', function(req,res){
    var forErnit1 = parseInt(req.body.ernit1);
    var forErnit2 = parseInt(req.body.ernit2);
    
    
    
    console.log("Debit Account by " + eval(forErnit1+forErnit2) + " and credit ernit-1 by " + forErnit1 +" , and ernit-2 by "+forErnit2);
    //Idiots :-/ so basically two calls to make now to DEBIT one account & CREDIT another account
    
    //1. Debit First from Main Account
    var debitMain = '{"account_id":"amandeep","bank_id":"test-bank","amount":'+ eval((-forErnit1+forErnit2)* -1)+'}';
    //Follow Syntax: request= oa.post("http://foo.com/blah", "token", "token_secret", "BLAH", "text/plain", function(e,d){})
    consumer.post("https://apisandbox.openbankproject.com/obp/v1.2.1/banks/test-bank/accounts/amandeep/owner/transactions",
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    debitMain,
    "application/json",
    function (error, data, response) {
        //Nest the credit ernit-1 & ernit-2 here
        console.log("Debit complete " , response);
    });
    
});

app.get('/getaccounts', function(req, res){
  consumer.get("https://apisandbox.openbankproject.com/obp/v1.2.1/banks/test-bank/accounts/private",
  req.session.oauthAccessToken,
  req.session.oauthAccessTokenSecret,
  function (error, data, response) {
      if (error != null) {
          res.redirect('/connect');
      } else {
      
      var parsedData = JSON.parse(data);
      var i= 0;
      var text ='';
      while (parsedData.accounts[i]) {
        text += "Account ID: " + parsedData.accounts[i].id +"<br>";
        if(parsedData.accounts[i].views_available != null && parsedData.accounts[i].views_available.length > 0) {
            text += ' <a href="/txndetails/'+parsedData.accounts[i].id+'">View Transactions</a><br><br>';
        } 
        i++;
      }
      res.status(200).send(text + data);
    }
  });
});

app.get('/txndetails/:accountid', function(req, res){
  
  consumer.get("https://apisandbox.openbankproject.com/obp/v1.2.1/banks/test-bank/accounts/"+req.params.accountid+"/owner/transactions",
  req.session.oauthAccessToken,
  req.session.oauthAccessTokenSecret,
  function (error, data, response) {
      var balance = 0;
      var currency = '';
      
      if (error != null) {
          res.redirect('/connect');
      } else {
          
          //Account balance STX
          consumer.get("https://apisandbox.openbankproject.com/obp/v1.2.1/banks/test-bank/accounts/"+req.params.accountid+"/owner/account",
            req.session.oauthAccessToken,
            req.session.oauthAccessTokenSecret,
            function (err, acctdata, resp) {
              console.log("1 " , err);
              console.log("2 ", acctdata);
              var account = JSON.parse(acctdata);
              console.log("Account balance for " + req.params.accountid + " is: " + account.balance.amount + " " + account.balance.currency);
              balance = account.balance.amount;
              currency = account.balance.currency;
              res.status(200).send( 'Total ' +balance + ' ' + currency + '<br><br>' + data);
          });
    }
  });
});

app.get('*', function(req, res){
  res.redirect('/connect');
});

app.listen(8089);