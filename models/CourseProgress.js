const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({

    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },
    compleredVideos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SubSection"
    }]

});

module.exports = mongoose.model("CourseProgress",courseProgressSchema);