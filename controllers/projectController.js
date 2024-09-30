require("dotenv").config();
const multer = require("multer");
const path = require("path");
const { ethers, big } = require("ethers");
const Project = require("../models/Project");
const Member = require("../models/Member");
const BurnTokenHistory = require("../models/BurnTokenHistory");

const erc20Abi = require("../abis/ERC20_token_abi.json");
const takeoverAbi = require("../abis/TokenTakeOver_abi.json");
const { default: mongoose } = require("mongoose");

const infura_url =
  process.env.NODE_ENV === "production"
    ? process.env.INFURA_URL
    : process.env.TEST_INFURA_URL;

const admin_private_key =
  process.env.NODE_ENV === "production"
    ? process.env.ADMIN_PRIVATE_KEY
    : process.env.TEST_ADMIN_PRIVATE_KEY;

const takeover_contract_address =
  process.env.NODE_ENV === "production"
    ? process.env.TAKEOVER_SMARTCONTRACT_ADDRESS
    : process.env.TEST_TAKEOVER_SMARTCONTRACT_ADDRESS;

const provider = new ethers.JsonRpcProvider(infura_url);

const signer = new ethers.Wallet(admin_private_key, provider);

const tokenTakeOverContract = new ethers.Contract(
  takeover_contract_address,
  takeoverAbi,
  signer
);

// Configure Multer for avatar and social image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "avatar") {
      cb(null, path.join(__dirname, "../public/images/avatars"));
    } else if (file.fieldname === "socialImage") {
      cb(null, path.join(__dirname, "../public/images/social_images"));
    }
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "socialImage", maxCount: 1 },
]);

exports.upload = upload;

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { avatar, socialImage } = req.files;
    const project = new Project({
      ...req.body,
      avatar: avatar ? avatar[0].filename : undefined,
      socialImage: socialImage ? socialImage[0].filename : undefined,
    });
    await project.save();
    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update an existing project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const avatar =
      req.file && req.file.avatar ? req.file.avatar.filename : undefined;
    const socialImage =
      req.file && req.file.socialImage
        ? req.file.socialImage.filename
        : undefined;

    const updates = {
      ...req.body,
      ...(avatar && { avatar }),
      ...(socialImage && { socialImage }),
    };
    const project = await Project.findByIdAndUpdate(id, updates, { new: true });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project updated successfully", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Verify the code sent by the user
exports.verifyCode = async (req, res) => {
  try {
    const { code } = req.params;

    const member = await Member.findOne({ currentCode: code });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const project = await Project.findOneAndUpdate(
      { owner: member.id },
      { status: "active" },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project verified successfully", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a specific project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Member joins a project and locks tokens
exports.joinProject = async (req, res) => {
  try {
    const { memberAddress, projectId, amount, totalWalletAmount } = req.body;
    const project = await Project.findById(projectId);

    if (!project || !memberAddress) {
      return res.status(404).json({ message: "Project or Member not found" });
    }
    const members = await Member.find({ address: memberAddress });
    project.joinedMembers.push({
      member: members[0]._id,
      lockedAmount: amount + Number,
      totalWalletAmount,
    });

    await project.save();

    res
      .status(200)
      .json({ message: "Member joined and tokens locked", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Check if member is joined to project
exports.checkIsJoinedToProject = async (req, res) => {
  try {
    const { memberAddress, projectId } = req.body;
    const project = await Project.findById(projectId);

    if (!project || !memberAddress) {
      return res.status(404).json({ message: "Project or Member not found" });
    }

    const member = await Member.findOne({ address: memberAddress });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const isJoined = project.joinedMembers.some((joinedMember) =>
      new mongoose.Types.ObjectId(member._id).equals(joinedMember.member)
    );

    if (isJoined) {
      return res
        .status(200)
        .json({ message: "Member joined already", joined: true });
    } else {
      return res
        .status(200)
        .json({ message: "Member never joined", joined: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
// Burn tokens from the project
exports.burnTokens = async (req, res) => {
  try {
    const { projectId, amount } = req.body;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const availableTokens = await tokenTakeOverContract.remainingLockedTokens(
      project.tokenAddress
    );
    console.log("Available locked tokens:", availableTokens.toString());

    const erc20Token = new ethers.Contract(
      project.tokenAddress,
      erc20Abi,
      provider
    );

    // Fetch the decimals for the token
    const decimals = await erc20Token.decimals();
    const burnAmount = ethers.parseUnits(amount.toString(), decimals);

    const tx = await tokenTakeOverContract.burnLockedTokens(
      project.tokenAddress,
      burnAmount,
      { gasLimit: 2000000 }
    );
    const receipt = await tx.wait();
    project.burned += amount;
    await project.save();

    const burnHistory = new BurnTokenHistory({
      projectId: project._id,
      burnAmount: amount,
      burnDate: new Date(),
      transactionHash: receipt?.hash,
    });
    await burnHistory.save();
    res.status(200).json({
      message: "Tokens burnt successfully",
      project,
      transactionHash: receipt?.hash,
    });
  } catch (error) {
    console.error("Error burning tokens:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
