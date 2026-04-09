const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'INVESTMENT' },
  imageUrl: { type: String },
  author: { type: String, default: 'Admin' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', BlogSchema);