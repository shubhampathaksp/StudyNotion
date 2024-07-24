const Tag = require("../models/Tags");

exports.createTag = async (req, res) => {
  try {
    //fetch name and description
    const { name, description } = req.body;

    //validation
    if (!name || !description) {
      return res.status(401).json({
        success: false,
        message: "All details are required",
      });
    }

    //create a entry in DB
    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });

    console.log(tagDetails);

    return res.status(200).json({
      success: true,
      message: "Tag created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.showAlltags = async (req, res) => {
  try {
    const allTags = await Tag.find({}, { name: true, description: true });

    return res.status(200).json({
      success: true,
      message: "All tags are fetched successfully",
      allTags,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};