const nodemailer = require("nodemailer");
require("dotenv").config();

exports.mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
        from: `"Study Notion - by Vedang" <${process.env.MAIL_USER}>`,
        to: email,
        subject: title,
        html: body

    });

    console.log("Message sent: %s",info.messageId)
    return info;
  } catch (error) {
    console.log("Error occured while sending email:", error);
  }
};
