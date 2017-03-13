var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');

if (!AWS.config.credentials || !AWS.config.credentials.accessKeyId)
    throw 'Need to update config.json to specify your access key!';

var db = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

function keyvaluestore(table) {
    this.inx = -1;
    this.LRU = require("lru-cache");
    this.cache = this.LRU({max: 500});
    this.tableName = table;
}
;

/**
 * Initialize the tables
 * 
 */
keyvaluestore.prototype.init = function (callback) {
    var tableName = this.tableName;
    var initCount = this.initCount;
    var self = this;

    db.listTables(function (err, data) {
        if (err)
            console.log(err, err.stack);
        else {
            console.log("Connected to AWS DynamoDB");
            var tables = data.TableNames.toString().split(",");
            console.log("Tables in DynamoDB: " + tables);
            if (tables.indexOf(tableName) == -1) {
                console.log("Need to create table " + tableName);

                var params = {
                    AttributeDefinitions:
                            [/* required */
                                {
                                    AttributeName: 'keyword', /* required */
                                    AttributeType: 'S' /* required */
                                },
                                {
                                    AttributeName: 'inx', /* required */
                                    AttributeType: 'N' /* required */
                                }
                            ],
                    KeySchema:
                            [/* required */
                                {
                                    AttributeName: 'keyword', /* required */
                                    KeyType: 'HASH' /* required */
                                },
                                {
                                    AttributeName: 'inx', /* required */
                                    KeyType: 'RANGE' /* required */
                                }
                            ],
                    ProvisionedThroughput: {/* required */
                        ReadCapacityUnits: 1, /* required */
                        WriteCapacityUnits: 1 /* required */
                    },
                    TableName: tableName /* required */
                };

                db.createTable(params, function (err, data) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("Waiting 10s for consistent state...")
                        setTimeout(function () {
                            self.initCount(callback)
                        }, 10000)
                    }
                });
            } else {
                self.initCount(callback);
            }
        }
    }
    );
}

/**
 * Gets the count of how many rows are in the table
 * 
 */
keyvaluestore.prototype.initCount = function (whendone) {
    var self = this;
    var params = {
        TableName: self.tableName,
        Select: 'COUNT'
    };

    db.scan(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            self.inx = data.ScannedCount;

            console.log("Params " + params);
            console.log("Found " + self.inx + " indexed entries in " + self.tableName);
            whendone();
        }
    });

}

/**
 * Get result(s) by key
 * 
 * @param search
 * 
 * Callback returns a list of objects with keys "inx" and "value"
 */
keyvaluestore.prototype.get = function (search, callback) {
            console.log("Busca:"+search+" en la tabla:"+this.tableName);

    var params = {
        TableName: this.tableName,
        KeyConditionExpression: "#term = :kw",
        ScanIndexForward:false,
        ExpressionAttributeNames: {
            "#term": "keyword"
        },
        ExpressionAttributeValues: {
            ":kw": search
        }
    };

    docClient.query(params, function (err, data) {
        if (err) {
            console.log(":( Unable to query. Error: ", JSON.stringify(err, null, 2));
        } else {
            console.log("Tabla:"+this.tableName+"Query '" + search + "' succeeded: " + data.Count + " record(s) found");
            console.log("\n");
            console.log(data.Items);
            console.log("\n");
        }

         // console.log("================1");
        callback(undefined, data.Items);
         // console.log("================2");
      
    });
};

/**
 * Test if search key has a match
 * 
 * @param search
 * @return
 */
keyvaluestore.prototype.exists = function (search, callback) {
    var self = this;

    if (self.cache.get(search))
        callback(null, self.cache.get(search));
    else
        module.exports.get(search, function (err, data) {
            if (err)
                callback(err, null);
            else
                callback(err, (data == null) ? false : true);
        });
};

/**
 * Get result set by key prefix
 * @param search
 *
 * Callback returns a list of objects with keys "inx" and "value"
 */
module.exports = keyvaluestore;
