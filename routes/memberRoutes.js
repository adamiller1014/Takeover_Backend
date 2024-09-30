const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");

// Member routes
router.post("/", memberController.createMember);
router.get("/", memberController.getMembers);
router.get("/address/:address", memberController.getMemberByAddress);

module.exports = router;
