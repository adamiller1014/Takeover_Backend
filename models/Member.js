const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    oauth_token: { type: String },
    oauth_token_secret: { type: String },
    currentCode: { type: String },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
