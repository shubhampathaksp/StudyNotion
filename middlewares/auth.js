const user = require("User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res, next) => {
    try {
        //extract token
        const token =
            req.cookies.token ||
            req.body.token ||
            req.header("Authorization").replace("Bearer ", "");

        //token missing
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }

        //verify token
        try {
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        } catch (error) {
            //verification - issue
            return res.status(401).json({
                success: false,
                message: "token is invalid",
            });

            next();
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while validating the token",
        });
    }
};

//Student
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for students",
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again",
        });
    }
};



//Admin

exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is the protected route for admin",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again",
        });
    }
};

//Instructor
exports.isInstructor = async (req, res, next) => {
    try {

        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is the protected route for instructor"
            })
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again",
        });
    }
};