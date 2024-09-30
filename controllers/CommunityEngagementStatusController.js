const CommunityEngagementStatus = require("../models/CommunityEngagementStatus");

exports.createEngagementStatus = async (req, res) => {
  try {
    const status = await CommunityEngagementStatus.findOneAndUpdate(
      { projectId: req.body.projectId },
      { ...req.body },
      { new: true }
    );

    if (!status) {
      const status = new CommunityEngagementStatus(req.body);
      await status.save();
    }
    res
      .status(200)
      .json({ message: "CommunityEngagementStatus Created", status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllEngagementStatuses = async (req, res) => {
  try {
    const statuses = await CommunityEngagementStatus.find();
    res.status(200).json(statuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEngagementStatusById = async (req, res) => {
  try {
    const status = await CommunityEngagementStatus.findById(req.params.id);
    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEngagementStatus = async (req, res) => {
  try {
    const updatedStatus = await CommunityEngagementStatus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStatus) {
      return res.status(404).json({ message: "Status not found" });
    }
    res.status(200).json(updatedStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEngagementStatus = async (req, res) => {
  try {
    const deletedStatus = await CommunityEngagementStatus.findByIdAndDelete(
      req.params.id
    );
    if (!deletedStatus) {
      return res.status(404).json({ message: "Status not found" });
    }
    res.status(200).json({ message: "Status deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEngagementMetrics = async (req, res) => {
  try {
    const engagementData = await fetchEngagementData(req.body.hashtag);

    const status = await CommunityEngagementStatus.findOneAndUpdate(
      { projectId: req.body.projectId },
      {
        totalLikes: engagementData.likes,
        totalRetweets: engagementData.retweets,
        totalReplies: engagementData.replies,
        totalQuotes: engagementData.quotes,
        totalActions:
          engagementData.likes +
          engagementData.retweets +
          engagementData.replies +
          engagementData.quotes,
        updatedAt: Date.now(),
      },
      { new: true, upsert: true }
    );

    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function fetchEngagementData(hashtag) {
  return {
    likes: Math.floor(Math.random() * 1000),
    retweets: Math.floor(Math.random() * 1000),
    replies: Math.floor(Math.random() * 1000),
    quotes: Math.floor(Math.random() * 1000),
  };
}
