const { TwitterApi } = require('twitter-api-v2');
const nodemailer = require('nodemailer');
// const Token = require("../models/Token");
const Member = require("../models/Member");
const Project = require("../models/Project");

const outlookSetup = {
  host: "smtp-mail.outlook.com",
  secureConnection: false,
  port: 587,
  tls: {
    ciphers: 'SSLv3'
  },
  auth: {
    user: process.env.PROVIDER_EMAIL,
    pass: process.env.PASSWORD_PROVIDER_EMAIL,
  },
}

async function getRequestToken() {
  try {
    const userClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
    });

    const res = await userClient.generateAuthLink(`${process.env.TWITTER_CALLBACK_URL}/api/twitter/auth/callback`);

    return res;
  } catch (error) {
    // console.error('Error generating request token:', error);
    console.log(error);
    throw error
  }
}

exports.getAuthToken = async (req, res) => {
  const { memberAddress, code } = req.params
  try {
    // check member is exist
    const memberExists = await Member.findOne({ address: memberAddress });
    if (!memberExists) {
      res.status(302).redirect(`${process.env.FRONTEND_URL}/takeover/set_project`);
      // return res.status(404).json({ message: 'user not found' })
    }

    const tokens = await getRequestToken();

    // store the oauth token secret to member
    const member = await Member.findOneAndUpdate(
      {
        address: memberAddress,
      },
      { oauth_token_secret: tokens.oauth_token_secret, oauth_token: tokens.oauth_token, currentCode: code },
      {
        new: true,
        upsert: true,
        // Return additional properties about the operation, not just the document
        includeResultMetadata: true
      }
    );

    return res.status(302).redirect(`${tokens.url}`)
  } catch (error) {
    res.status(500).json({ message: 'Failed to redirect to Twitter', error });
  }
}

exports.sendCodeToUser = async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;

  try {
    const member = await Member.findOne({ oauth_token });
    const oauth_token_secret = member.oauth_token_secret;

    // create new client
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: oauth_token,
      accessSecret: oauth_token_secret,
    });

    const response = await client.login(oauth_verifier);
    const user = await response.client.v1.verifyCredentials({
      include_email: true,
    });

    // findProject by unique code
    const project = await Project.findOne({ uniqueCode: member.currentCode })

    // Send email to the user with the code project
    const transporter = nodemailer.createTransport(outlookSetup);
    const mailOptions = {
      from: process.env.PROVIDER_EMAIL,
      to: user.email,
      subject: project?.projectName,
      html: `<p>Your Code is</p>
            <p>${member?.currentCode}</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(302).redirect(`${process.env.FRONTEND_URL}/takeover/verify_project`)
    // res.send('Authorization successful and tokens stored in MongoDB.');
  } catch (error) {
    console.error('Error exchanging request token for access token:', error);
    res.status(500).send('Failed to authorize with Twitter');
  }
}

exports.getUserData = async (req, res) => {
  const {
    username
  } = req.params
  try {
    const appOnlyClient = new TwitterApi(process.env.TWITTER_AUTH_TOKEN);

    const user = await appOnlyClient.v2.userByUsername(username, {
      'user.fields': 'created_at,description',
    });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching twitter user", error });
  }
};

exports.sendTwitterDM = async (req, res) => {
  const { participantId, text } = req.body
  try {
    const dm = await userClient.v2.sendDmToParticipant(participantId, {
      attachments: [],
      text
    })

    return res.status(200).json(dm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending DM", error });
  }
};

exports.getSocialActions = async (req, res) => {
  const { hastag } = req.body

  const userClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_SECRET_TOKEN,
  });

  let allTweets = [];
  let nextToken = undefined;

  const exampleResponse = {
    "data": [
      {
        "id": "1458762321752320001",
        "text": "The first snow of the season is here! #winter #snow",
        "author_id": "123456789",
        "created_at": "2024-08-23T18:30:00.000Z",
        "public_metrics": {
          "retweet_count": 10,
          "reply_count": 2,
          "like_count": 50,
          "quote_count": 1
        }
      },
      {
        "id": "1458762331752320002",
        "text": "Snow in August? That's crazy!",
        "author_id": "987654321",
        "created_at": "2024-08-23T18:35:00.000Z",
        "public_metrics": {
          "retweet_count": 5,
          "reply_count": 1,
          "like_count": 25,
          "quote_count": 0
        }
      }
    ],
    "meta": {
      "newest_id": "1458762331752320002",
      "oldest_id": "1458762321752320001",
      "result_count": 2,
      "next_token": "b26v89c19zqg8o3fpdg3pgfv45"
    }
  }

  try {
    do {
      // Make the API request with pagination support
      const response = await userClient.v2.search(hastag, {
        max_results: 100, // Fetch the maximum number of tweets per request
        'tweet.fields': 'created_at,public_metrics',
        next_token: nextToken // Use the next_token from the previous request
      });

      // Add the current page of tweets to the collection
      allTweets = allTweets.concat(response?.data?.data || []);

      // Get the next token for pagination
      nextToken = response.meta.next_token;

    } while (nextToken); // Continue fetching while there is a next_token


    let likes = 0;
    let retweets = 0;
    let replies = 0;
    let quotes = 0;
    let totalActions = 0;

    // exampleResponse.data.forEach((item) => {
    //   likes += item.public_metrics.like_count;
    //   retweets += item.public_metrics.retweet_count;
    //   replies += item.public_metrics.reply_count;
    //   quotes += item.public_metrics.quote_count;
    // })
    allTweets.forEach((item) => {
      likes += item.public_metrics.like_count;
      retweets += item.public_metrics.retweet_count;
      replies += item.public_metrics.reply_count;
      quotes += item.public_metrics.quote_count;
    })

    totalActions = likes + retweets + replies + quotes;

    return res.status(200).json({ likes, retweets, replies, quotes, totalActions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error request", error });
  }
};