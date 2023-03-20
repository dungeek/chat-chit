const { Router } = require('express');

const MessageService = require('../services/message');

/**
 * A router for routing `message` HTTP requests.
 */
const router = Router();

router.get('/', async (req, res) => {
    const sender = req.query.sender;
    const messages = await MessageService.retrieveForUser(sender);
    res.json(messages);
});

router.post('/', async (req, res) => {
    const message = JSON.parse(req.body);
    res.json(await MessageService.createMessage(message));
});

module.exports = router;