const mongoose = require("mongoose");

const BurnTokenHistorySchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  burnAmount: { type: Number, required: true },
  burnDate: { type: Date, default: Date.now },
  transactionHash: { type: String, required: true },
  burnReason: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const BurnTokenHistory = mongoose.model(
  "BurnTokenHistory",
  BurnTokenHistorySchema
);
module.exports = BurnTokenHistory;
