const mongoose = require("mongoose");

//EDIT FILE TO REFLECT TRAIL PROFILE

const PlantSchema = new mongoose.Schema({
  // new Owner field:
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // points to the User collection
    required: true,
  },
  // updated fields to match .csv headers
  trail_name: {
    type: String,
    default: "Unknown Trail",
  },
  family: {
    type: String,
  },
  description: {
    type: String,
  },
  img_url: {
    type: String,
  },
});

module.exports = mongoose.model("Plant", PlantSchema);
