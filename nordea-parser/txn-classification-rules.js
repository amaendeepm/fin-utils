
var rules_fnb = ["Fakta","Netto","Irma","Spar","Bilka","LIDL","Slagter","Rema 1000"];
var rules_util = ["Mobil","Dong"];
var rules_payments = ["Bgs"];
var rules_cash = ["Pengeautomat"];
var rules_travel = ["RYANAIR","DB BAHN","Easy Jet","Rejse","Ferie","SCANDLINES"];
var rules_extras = ["Coffee","Cafe","7-Eleven"];

String.prototype.matchWithTokens = function(tokens){
  for(i=0; i< tokens.length; i++) {
    if(this.toLowerCase().indexOf(tokens[i].toLowerCase()) != -1) {
      return true;
    }
  }
    return false;
};

var rules = [ //Done via rule-engine so that later more complicated rules can be handled here
  {
	   "condition": function(R) {
         this.category="Unknown";
		     R.when(this && (this.Text.matchWithTokens(rules_fnb)));
	      },
	  "consequence": function(R) {
		    this.category = "Retail F&B";
        console.log(this.Text + " gets category = " + this.category);
		      R.stop();
	      }
  },
  {
	   "condition": function(R) {
         this.category="Unknown";
		     R.when(this && (this.Text.matchWithTokens(rules_travel)));
	      },
	  "consequence": function(R) {
		    this.category = "Travel";
		      R.stop();
	      }
  },
  {
	   "condition": function(R) {
         this.category="Unknown";
		     R.when(this && (this.Text.matchWithTokens(rules_extras)));
	      },
	  "consequence": function(R) {
		    this.category = "Extras";
		      R.stop();
	      }
  },
  {
	   "condition": function(R) {
         this.category="Unknown";
		     R.when(this && (this.Text.matchWithTokens(rules_payments)));
	      },
	  "consequence": function(R) {
		    this.category = "Payments";
		      R.stop();
	      }
  },
  {
	   "condition": function(R) {
         this.category="Unknown";
		     R.when(this && (this.Text.matchWithTokens(rules_util)));
	      },
	  "consequence": function(R) {
		    this.category = "Utilities";
		      R.stop();
	      }
  },
  {
	   "condition": function(R) {
         this.category="Unknown";
		     R.when(this && (this.Text.matchWithTokens(rules_cash)));
	      },
	  "consequence": function(R) {
		    this.category = "Cash Withdrawal";
		      R.stop();
	      }
  }
];

exports.rules = rules;
