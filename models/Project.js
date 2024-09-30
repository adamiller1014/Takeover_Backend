const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    uniqueCode: { type: String, required: true },
    chainId: { type: String, required: true },
    tokenAddress: { type: String, required: true },
    tokenDecimals: { type: Number, default: 18 },
    tokenSymbol: { type: String, required: true },
    officialWebsite: { type: String, required: true },
    interactionHashtag: { type: String, required: true },
    projectSocials: { type: Object, required: true },
    description: { type: String, required: true },
    ranking: { type: Number, default: 1 },
    actions: { type: Number, default: 0 },
    burned: { type: Number, default: 0 },
    avatar: { type: String, required: true },
    socialImage: { type: String, required: true },

    // Twitter thresholds
    twitterThresholds: {
      likes: {
        threshold: { type: Number },
        burnAmount: { type: Number },
      },
      shares: {
        threshold: { type: Number },
        burnAmount: { type: Number },
      },
      comments: {
        threshold: { type: Number },
        burnAmount: { type: Number },
      },
      retweets: {
        threshold: { type: Number },
        burnAmount: { type: Number },
      },
    },
    // TokenTakeover thresholds
    takeoverThresholds: {
      holdersJoined: {
        threshold: { type: Number },
        burnAmount: { type: Number },
      },
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    joinedMembers: [
      {
        member: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
        lockedAmount: { type: Number },
        totalWalletAmount: { type: Number },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
