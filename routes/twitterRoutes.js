const express = require("express");
const router = express.Router();
const twitterController = require("../controllers/twitterController");

// Project routes
router.get("/user/:username", twitterController.getUserData);
router.post("/message", twitterController.sendTwitterDM);
router.post("/getSocialActions", twitterController.getSocialActions);
// Example Express route to handle the redirect
router.get('/auth/memberAddress/:memberAddress/code/:code', twitterController.getAuthToken);
router.get('/auth/callback', twitterController.sendCodeToUser);

module.exports = router;
