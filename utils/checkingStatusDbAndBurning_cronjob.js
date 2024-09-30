const cron = require("node-cron");
const Project = require("../models/Project");
const CommunityEngagementStatus = require("../models/CommunityEngagementStatus");
const BurnTokenHistory = require("../models/BurnTokenHistory");
const { burnTokens } = require("../controllers/projectController");

// Function to define and schedule the cron job
function scheduleCronJob() {
  // Running every 1 hour
  cron.schedule("0 * * * *", async () => {
    console.log("Running cron job to check for engagement thresholds...");

    const projects = await Project.find();
    for (const project of projects) {
      const engagementStatus = await CommunityEngagementStatus.findOne({
        projectId: project._id,
      });
      console.log(
        "Running cron job to check for engagement thresholds...",
        engagementStatus,
        project._id
      );
      if (engagementStatus) {
        const {
          likes,
          comments,
          shares,
          retweets,
          // holdersJoinedPercentage,
        } = engagementStatus;
        const { twitterThresholds, takeoverThresholds } = project;
        // console.log(twitterThresholds, takeoverThresholds);
        let tokensToBurn = 0;

        // Check Twitter thresholds
        if (likes >= twitterThresholds.likes.threshold) {
          tokensToBurn += twitterThresholds.likes.burnAmount;
        }
        if (comments >= twitterThresholds.comments.threshold) {
          tokensToBurn += twitterThresholds.comments.burnAmount;
        }
        if (shares >= twitterThresholds.shares.threshold) {
          tokensToBurn += twitterThresholds.shares.burnAmount;
        }
        if (retweets >= twitterThresholds.retweets.threshold) {
          tokensToBurn += twitterThresholds.retweets.burnAmount;
        }

        // // Check TokenTakeover thresholds
        // if (
        //   holdersJoinedPercentage >= takeoverThresholds.holdersJoined.threshold
        // ) {
        //   tokensToBurn += takeoverThresholds.holdersJoined.burnAmount;
        // }
        if (tokensToBurn > 0) {
          try {
            // Prepare request object for burnTokens function
            const req = {
              body: {
                projectId: project._id,
                amount: tokensToBurn, // Total amount to burn
              },
            };

            // Mocking res object to handle the response from burnTokens
            const res = {
              status: (statusCode) => ({
                json: (response) =>
                  console.log(
                    `Status: ${statusCode}, Response: ${JSON.stringify(
                      response
                    )}`
                  ),
              }),
            };

            // Call the burnTokens function
            await burnTokens(req, res);
            console.log(`Tokens burned for project: ${project.projectName}`);

            // Reset the engagement status
            engagementStatus.likes = 0;
            engagementStatus.comments = 0;
            engagementStatus.shares = 0;
            engagementStatus.retweets = 0;
            engagementStatus.holdersJoinedPercentage = 0;
            await engagementStatus.save();
          } catch (error) {
            console.error(
              `Failed to burn tokens for project: ${project.projectName}`,
              error
            );
          }
        }
      }
    }
  });
}

// Export the function so it can be used in other files
module.exports = { scheduleCronJob };
