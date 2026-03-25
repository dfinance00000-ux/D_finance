const mongoose = require('mongoose');

const advisorSchema = new mongoose.Schema({
  advisorCode: { type: String, unique: true },
  name: { type: String, required: true },
  rank: { type: String, required: true }, // From Rank Master
  sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advisor', default: null }, // Downline logic
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Advisor', advisorSchema);
// Advisor Downline Fetcher
exports.getDownline = async (advisorId) => {
  const downline = await Advisor.find({ sponsorId: advisorId });
  let fullTree = [];

  for (let advisor of downline) {
    const children = await this.getDownline(advisor._id);
    fullTree.push({
      ...advisor._doc,
      children: children
    });
  }
  return fullTree;
};