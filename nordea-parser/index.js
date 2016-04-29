var fs = require('fs');
var parse = require('csv-parse');
var transform = require('stream-transform');
var rdb = require('rethinkdb');
var RuleEngine = require('node-rules');
var _ = require('underscore');
var dateFmt = require("date-format-lite");
var random = require("random-js")(); // using the nativeMath engine


var dbconfig = require('./config.js');
var txn_rules = require('./txn-classification-rules.js');
var R = new RuleEngine(txn_rules.rules);
var rowCount = 0, txnLines = 0;
var dbCon;

var args = process.argv.slice(2);
if (args.length === 0) {
    console.log("Please provide Bank Statement File name (full path) to parse as argument ... Exiting! ");
    process.exit(0);
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var tempFile = random.integer(1, 1000) + '.dat';
var parser = parse({delimiter: ';', skip_empty_lines: true, columns: ['Date', 'Text', 'TxDate', 'Amount', 'Balance'], auto_parse: true});

fs.readFileSync('./' + args[0]).toString().split('\n').forEach(function (line) {
    if (line.trim().length > 0 && rowCount > 0) { //Only if it is non-empty line & Skip first non-empty line i.e. header as well
        fs.appendFileSync("./" + tempFile, line.toString().replaceAll(",", ".") + "\n");
    }
    rowCount++;
});

var input = fs.createReadStream(tempFile);


parser.on("readable", function () {
    var record;
    while (record = parser.read()) {
        txnLines++;
        R.execute(record, function (result) {
            rdb.connect(dbconfig.rethinkdb, function (err, conn) {
                if (err) {
                    console.log("Could not open a connection to initialize the database");
                    console.log(err.message);
                    process.exit(1);
                }
                rdb.table("txns").insert(result).run(conn);
        });
        saveTxn(result);
        });
    }
});

parser.on("error", function (error) {
  console.log(" ** Error: " + error);
});

parser.on("end", function () {
  console.log("Parsing Completed, Total " + txnLines + " transactions processed!");
});

function saveTxn(record) {
  //console.log(">> ", record.Date.date("YYYY-MM-DD"));
}

input.pipe(parser);
