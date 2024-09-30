const express = require("express");
const router = express.Router();
const burnTokenHistoryController = require("../controllers/BurnTokenHistoryController");

// Create a new burn token history record
router.post("/burn-history", burnTokenHistoryController.createBurnTokenHistory);

// Get all burn token history records
router.get(
  "/burn-history",
  burnTokenHistoryController.getAllBurnTokenHistories
);

// Get a specific burn token history record by ID
router.get(
  "/burn-history/:id",
  burnTokenHistoryController.getBurnTokenHistoryById
);

// Delete a burn token history record by ID
router.delete(
  "/burn-history/:id",
  burnTokenHistoryController.deleteBurnTokenHistory
);

// Trigger a burn event and record it (custom logic)
router.post(
  "/burn-history/trigger",
  burnTokenHistoryController.triggerBurnEvent
);

module.exports = router;
