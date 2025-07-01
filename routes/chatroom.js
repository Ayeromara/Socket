const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const Poll = require('../models/Poll');

// GET messages for a room
router.get('/messages/:room', async (req, res) => {
  const { room } = req.params;
  const messages = await Message.find({ room }).sort({ timestamp: 1 });
  res.json(messages);
});

// GET poll for a room
router.get('/poll/:room', async (req, res) => {
  const { room } = req.params;
  const poll = await Poll.findOne({ room });
  res.json(poll);
});

// POST vote to a poll
router.post('/vote', async (req, res) => {
  const { room, option } = req.body;
  const poll = await Poll.findOne({ room });
  if (!poll) return res.status(404).json({ error: 'Poll not found' });

  poll.votes.set(option, (poll.votes.get(option) || 0) + 1);
  await poll.save();

  res.json(poll);
});

module.exports = router;
ye