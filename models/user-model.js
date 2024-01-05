const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  profilePhoto: {
    type: String,
    default:
      "http://res.cloudinary.com/radheshyam11/image/upload/v1628524847/ggfox5fjnoqc5ldummob.png",
  },
  description: {
    type: String,
    default: "",
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
});

UserSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", UserSchema);

module.exports = User;
