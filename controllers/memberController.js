const Member = require("../models/Member");

// Create new member
exports.createMember = async (req, res) => {
  const { address } = req.body;

  try {
    const members = await Member.find({ address });
    if (members.length > 0) {
      res
        .status(201)
        .json({ message: "Member already exist", member: members[0] });
    } else {
      const member = new Member({ address });
      await member.save();
      res.status(201).json({ message: "Member created successfully", member });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating member", error });
  }
};

// Get member By Address
exports.getMemberByAddress = async (req, res) => {
  try {
    const members = await Member.find({ address: req.params.address });
    res.status(200).json({ members });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching members", error });
  }
};

// Get all members
exports.getMembers = async (req, res) => {
  try {
    const members = await Member.find();
    res.status(200).json({ members });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching members", error });
  }
};
