const OTP = require("../models/OTP");
const User = require("../models/User");
const otpGenerator = require("otp-generator");


//send otp
exports.sendOTP = async (req,res)=>{
    try{

        const {email} = req.body;

        const checkUserPresent = await User.findOne({email});

        if(checkUserPresent){
            return res.status(401).json({
                succes:false,
                message:"User already exist",
            });
        }

        //generate otp

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });

        console.log("OTP generate: ", otp);

        let result = await OTP.findOne({otp: otp});

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });

            result = await OTP.findOne({otp: otp });
        }
        const otpPayload = {email, otp};

        //create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        res.status(200).json({
            succes: true,
            message: "OTP sent successfully",
        });
    }catch(error){
        console.log(error);
        res.status(500).json({
            succes:false,
            message:error.message,
        });
    }
};