const MongoClient = require('mongodb').MongoClient;
let cachedDb = null;

exports.dbConnection = function(uri,dbName, callback) {
    console.log('=> connect to database');

  return MongoClient.connect(uri)
    .then(client => {
      console.log("Connecting......")
      cachedDb = client.db(dbName);
      return { db: cachedDb, client: client };
    });
}