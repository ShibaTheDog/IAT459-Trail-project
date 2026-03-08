const mongoose = require("mongoose");

//EDIT FILE TO REFLECT USER PROFILE

const PlantSchema = new mongoose.Schema({
  // new Owner field:
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // points to the User collection
    required: true,
  },
  // updated fields to match .csv headers
  common_name: {
    type: String,
    default: "Unknown Plant",
  },
  family: {
    type: String,
  },
  categories: {
    type: String,
  },
  origin: {
    type: String,
  },
  climate: {
    type: String,
  },

  img_url: {
    type: String,
  },
});

module.exports = mongoose.model("Plant", PlantSchema);
