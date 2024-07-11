const OTP = require("../models/OTP");
const User = require("../models/User");
const otpGenerator = require("otp-generator");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
require("dotenv").config();


//send otp
exports.sendOTP = async (req, res) => {
    try {

        const { email } = req.body;

        const checkUserPresent = await User.findOne({ email });

        if (checkUserPresent) {
            return res.status(401).json({
                succes: false,
                message: "User already exist",
            });
        }

        //generate otp

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        console.log("OTP generate: ", otp);

        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });

            result = await OTP.findOne({ otp: otp });
        }
        const otpPayload = { email, otp };

        //create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        res.status(200).json({
            succes: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};

//signup
exports.signUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp,
            contactNumber,
        } = req.body;

        //validate krlo

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !otp
        ) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            });
        }

        //2 password match krwao

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and ConfirmPassword Value does not match, please try gain",
            });
        }

        //check user already exist or not
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exist",
            });
        }

        //find most recent OTP
        const recentOtp = await OTP.find({ email })
            .sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);


        //validate OTp
        if (recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: "Fill the OTP",
            });
        } else if (otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //entry create in DB

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        return res.status(200).json({
            success: true,
            message: "User registered Successfully",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "User cannot be registerd. Please try again",
        });
    }
};



//login

exports.login = async (req, res) => {
    try {
        // fetch data from req body
        const { email, password } = req.body;

        //validation
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            });
        }

        //user check exist or not
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(403).json({
                success: false,
                message: "User not registered, please signup first",
            });
        }

        //compare password
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });

            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            // create cookie and send response
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in successfully",
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "password is incorrect",
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login Failure, please try again",
        });
    }
};





//change password