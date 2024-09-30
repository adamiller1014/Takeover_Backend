const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  approveProject,
  suspendProject,
} = require("../controllers/adminController");

router.put(
  "/approve/:id",
  passport.authenticate("jwt", { session: false }),
  approveProject
);
router.put(
  "/suspend/:id",
  passport.authenticate("jwt", { session: false }),
  suspendProject
);

module.exports = router;
