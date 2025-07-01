// controllers/chatroomController.js
const Message = require('../models/message');
const Poll = require('../models/polls');
const categoryGroups = require('../data/category');

exports.getCategories = (req, res) => {
  res.json(Object.keys(categoryGroups));
};

exports.getRoomsByCategory = (req, res) => {
  const { category } = req.params;
  const rooms = categoryGroups[category];
  if (!rooms) return res.status(404).json({ error: 'Category not found' });
  res.json(rooms);
};

exports.getMessages = async (req, res) => {
  const { room } = req.params;
  const messages = await Message.find({ room });
  res.json(messages);
};

exports.getPoll = async (req, res) => {
  const { room } = req.params;
  let poll = await Poll.findOne({ room });

  if (!poll) {
    // You can dynamically generate options if you have a data source for nominees.
    // For now, we'll use static options.
    const options = ['Nominee A', 'Nominee B', 'Nominee C'];
    poll = new Poll({
      room,
      question: `Vote for the best in ${room}`,
      options,             
      votes: Object.fromEntries(options.map(o => [o, 0]))
    });
    await poll.save();
  }

  res.json(poll);
};


exports.submitVote = async (req, res) => {
  const { room, option } = req.body;
  const poll = await Poll.findOne({ room });

  if (poll && poll.options.includes(option)) {
    poll.votes[option] = (poll.votes[option] || 0) + 1;
    await poll.save();
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid vote' });
  }
};