const BurnTokenHistory = require("../models/BurnTokenHistory");
exports.createBurnTokenHistory = async (req, res) => {
  try {
    const newBurn = new BurnTokenHistory(req.body);
    const savedBurn = await newBurn.save();
    res.status(201).json(savedBurn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAllBurnTokenHistories = async (req, res) => {
  try {
    const burnHistories = await BurnTokenHistory.find();
    res.status(200).json(burnHistories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getBurnTokenHistoryById = async (req, res) => {
  try {
    const burnHistory = await BurnTokenHistory.findById(req.params.id);
    if (!burnHistory) {
      return res.status(404).json({ message: "Burn history not found" });
    }
    res.status(200).json(burnHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.deleteBurnTokenHistory = async (req, res) => {
  try {
    const deletedBurn = await BurnTokenHistory.findByIdAndDelete(req.params.id);
    if (!deletedBurn) {
      return res.status(404).json({ message: "Burn history not found" });
    }
    res.status(200).json({ message: "Burn history deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.triggerBurnEvent = async (req, res) => {
  try {
    const { projectId, burnAmount, burnReason } = req.body;

    const transactionHash = await burnTokensOnBlockchain(projectId, burnAmount);

    const newBurn = new BurnTokenHistory({
      projectId,
      burnAmount,
      transactionHash,
      burnReason,
      burnDate: Date.now(),
    });

    const savedBurn = await newBurn.save();
    res.status(201).json(savedBurn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
async function burnTokensOnBlockchain(projectId, burnAmount) {
  return `0x${Math.floor(Math.random() * 10000000000000000).toString(16)}`;
}
