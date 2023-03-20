const MongoClient = require('mongodb').MongoClient;

/**
 * A class that helps you handle with MongoDB Server easily.
 */
class Database {
    /**
     * @private The only instance of this class.
     */
    static instance = undefined;

    /**
     * @private The constructor cannot be invoked externally but internally
     * @param db is a reference to the connected MongoDB database otained by MongoClient.connect
     */
    constructor(db) {
        //the db reference is stored as an instance property named db
        this.db = db;
    }

    /**
     * Starts connecting to a MongoDB server.
     *
     * @param {String} url the connection url.
     * @param {String} databaseName the database's name.
     */
    static async connect(url = '', databaseName = '') {
        //db is database , databaseName is just a name to sign
        const db = (await MongoClient.connect(url)).db(databaseName); //assign db
        Database.instance = new Database(db);
    }

    /**
     * Retrieves the connected database instance.
    *
    * @throws an error if the database isn't connected.
    */
   static getDb() {
       if (!!Database.instance) {
           //Call constructor, return databse
           return Database.instance.db;
        }
        throw new Error('Not connected yet');
    }
}

module.exports = Database;
