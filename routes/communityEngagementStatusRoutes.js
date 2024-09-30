const express = require("express");
const router = express.Router();
const communityEngagementStatusController = require("../controllers/CommunityEngagementStatusController");

// Create a new community engagement status
router.post("/", communityEngagementStatusController.createEngagementStatus);

// Get all community engagement statuses
router.get("/", communityEngagementStatusController.getAllEngagementStatuses);

// Get a specific community engagement status by ID
router.get("/:id", communityEngagementStatusController.getEngagementStatusById);

// Update a community engagement status by ID
router.put("/:id", communityEngagementStatusController.updateEngagementStatus);

// Delete a community engagement status by ID
router.delete(
  "/:id",
  communityEngagementStatusController.deleteEngagementStatus
);

// Update engagement metrics (custom logic)
router.post(
  "/update-metrics",
  communityEngagementStatusController.updateEngagementMetrics
);

module.exports = router;
