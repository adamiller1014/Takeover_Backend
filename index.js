const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const path = require("path");
const Member = require("./models/Member");
const Project = require("./models/Project");
const {
  scheduleCronJob,
} = require("./utils/checkingStatusDbAndBurning_cronjob");

require("dotenv").config();
require("./config/passport")(passport);

const app = express();

// Connect to MongoDB
connectDB();

// Serve static files
app.use(
  "/images/avatars",
  express.static(path.join(__dirname, "public/images/avatars"))
);
app.use(
  "/images/social_images",
  express.static(path.join(__dirname, "public/images/social_images"))
);

// Middleware
app.use(express.json());
app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "https://cut-daddy-project-cc1g.vercel.app/",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/twitter", require("./routes/twitterRoutes"));
app.use("/api/email", require("./routes/emailRoutes"));
app.use(
  "/api/community_engagement_status",
  require("./routes/communityEngagementStatusRoutes")
);
app.use("/api/burn_token_history", require("./routes/burnTokenHistoryRoutes"));

// Seed the database with default data
const seedDatabase = async () => {
  try {
    // Check if the admin user already exists
    const adminExists = await User.findOne({ username: "admin" });

    if (adminExists) {
      console.log("Admin user already exists");
    } else {
      // Create a new admin user
      const hashedPassword = await bcrypt.hash("admin", 10);
      const admin = new User({
        username: "admin",
        password: hashedPassword,
        role: "admin",
      });
      await admin.save();
    }

    // Check if the member already exists
    const memberExists = await Member.findOne();

    if (memberExists) {
      console.log("member already exists");
    } else {
      // Create a new member
      const member = new Member({
        address: "0x215aB14f5C30791C3c01974e5c6E733276EeF0F4",
      });
      const a = await member.save();

      // Create new Projects
      const projects = [
        {
          projectName: "Sample Project - Kattios Cats",
          chainId: "1",
          tokenAddress: "0x40c0b70eec5afcf050561b07277fd78b46ca7e9b",
          tokenSymbol: "Kattios",
          officialWebsite: "https://www.sampleproject1.com",
          interactionHashtag: "#SampleProject1",
          projectSocials: {
            twitter: "https://twitter.com/sampleproject1",
            website: "https://discord.com/invite/sampleproject1",
            telegram: "https://t.me/sampleproject1",
          },
          description: "This is the first sample project for testing purposes.",
          ranking: 3,
          actions: 21,
          burned: 1500000,
          avatar: "avatar_1.png",
          socialImage:
            "http://localhost:5000/images/social_images/social_image_1.png",
          burnThresholds: [100, 500, 1000],
          owner: a._id,
          joinedMembers: [{ member: a._id }],
          uniqueCode: "0XM9",
        },
        {
          projectName: "Sample Project - Proton",
          chainId: "1",
          tokenAddress: "0xD7EFB00d12C2c13131FD319336Fdf952525dA2af",
          tokenSymbol: "XPR",
          officialWebsite: "https://www.sampleproject2.com",
          interactionHashtag: "#SampleProject2",
          projectSocials: {
            twitter: "https://twitter.com/sampleproject2",
            website: "https://discord.com/invite/sampleproject2",
            telegram: "https://t.me/sampleproject2",
          },
          description:
            "This is the second sample project for testing purposes.",
          ranking: 1,
          actions: 123,
          burned: 700000,
          avatar: "avatar_2.png",
          socialImage:
            "http://localhost:5000/images/social_images/social_image_2.png",
          burnThresholds: [200, 400, 800],
          owner: a._id,
          joinedMembers: [{ member: a._id }],
          uniqueCode: "0XX0",
        },
      ];

      Project.insertMany(projects)
        .then((docs) => {
          console.log("Projects added:", docs);
        })
        .catch((err) => {
          console.error("Error adding projects:", err);
        });
    }
    console.log("Admin user And Member created successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

// Call the seed function
seedDatabase();

scheduleCronJob();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
