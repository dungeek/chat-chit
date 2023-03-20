const Database = require('../db');

const MESSAGE_TEMPLATE = {
    sender: '',
    receiver: '',
    content: {
        type: '',
        value: '',
    },
};

/**
 * Retrieves the messages sent by a user.
 *
 * @param {String} user the sender's username.
 */
async function retrieveForUser(user = '') {
    const cursor = Database.getDb().collection('message').find({
        sender: user,
    }); // default: 20 documents
    const messages = [];
    cursor.forEach((doc) => {
        messages.push(doc);
    });
    return messages;
}

/**
 * Adds a message to the database.
 *
 * @param {Object} message the message.
 */
async function createMessage(message = MESSAGE_TEMPLATE) {
    // TODO: Validate the message.
    return Database.getDb().collection('message').insert({
        ...message,
        sentTime: new Date(),
    });
}

module.exports = {
    retrieveForUser,
    createMessage,
};