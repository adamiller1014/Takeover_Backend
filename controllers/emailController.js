const nodemailer = require('nodemailer');

exports.sendMailToAdmin = async (req, res) => {
  const outlookSetup = {
    host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
      ciphers: 'SSLv3'
    },
    auth: {
      user: process.env.PROVIDER_EMAIL,
      pass: process.env.PASSWORD_PROVIDER_EMAIL,
    },
  }

  try {
    const transporter = nodemailer.createTransport(outlookSetup);
    const { projectName, uniqueCode } = req.body;
    // // Send email to the user with the reset password link
    const mailOptions = {
      from: process.env.PROVIDER_EMAIL,
      to: process.env.RECEIVER_EMAIL,
      subject: projectName,
      html: `<p>${uniqueCode}</p>
            <p>approve this</p>`,
    };

    await transporter.sendMail(mailOptions);
    // console.log(data);
    res.status(200).json({ message: 'Code has been sent to admin' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};