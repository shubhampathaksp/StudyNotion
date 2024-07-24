const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//reset password token

exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your email is not registered with us",
      });
    }

    const token = crypto.randomUUID();

    const updateDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    const url = `http://localhost:3000/update-password/${token}`;

    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link:${url} `
    );

    return res.status(200).json({
      success: true,
      message:
        "Email sent successfully, please check email and change your passowrd",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending the token",
    });
  }
};

//reset password

exports.resetPassword = async (req, res) => {
  try {
    //data fetch
    const { password, confirmPassword, token } = req.body;

    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Passoword not matching",
      });
    }

    const userDetails = await user.findOne({ token: token });

    //if no entry
    


    // token time check
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(401).json({
        successs: false,
        message: "Token is expired, please regenerate your token",
      });
    }

    //hash password

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    // return response
    return res.status(200).json({
      success:true,
      message:"Password reset successfully"
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reseting the password",
    });
  }
};