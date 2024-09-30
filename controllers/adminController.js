const Project = require("../models/Project");
const User = require("../models/User");

// Get all admins
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" });
    res.status(200).json({ admins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching admins", error });
  }
};

exports.approveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    project.status = "approved";
    await project.save();

    res.json({ msg: "Project approved" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.suspendProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    project.status = "suspended";
    await project.save();

    res.json({ msg: "Project suspended" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
