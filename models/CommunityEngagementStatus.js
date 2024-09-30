const mongoose = require("mongoose");

const CommunityEngagementStatusSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  hashtag: { type: String, required: true },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  retweets: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const CommunityEngagementStatus = mongoose.model(
  "CommunityEngagementStatus",
  CommunityEngagementStatusSchema
);
module.exports = CommunityEngagementStatus;
