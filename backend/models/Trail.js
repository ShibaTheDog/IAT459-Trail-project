const mongoose = require("mongoose");


//Trail report schema containing information about the type of reported post and why its offensive, which is reviewed by admininstrators.
const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["offensive", "harassment", "hate_speech", "spam", "other"],
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

//Trail schema containing information that will be shown to the users when they review trails. 
const trailSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
  },
  imgUrl: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  moderationStatus: {
    type: String,
    enum: ["active", "under_investigation", "removed"],
    default: "active",
  },
  reports: {
    type: [reportSchema],
    default: [],
  },
});

module.exports = mongoose.model("Trail", trailSchema);