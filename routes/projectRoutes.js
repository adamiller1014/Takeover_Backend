const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

// Project routes
router.post("/", projectController.upload, projectController.createProject);
router.post("/join", projectController.joinProject);
router.post("/checkisjoined", projectController.checkIsJoinedToProject);
router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProjectById);

router.put("/:id", projectController.upload, projectController.updateProject);

router.put("/verify/:code", projectController.verifyCode);

module.exports = router;
