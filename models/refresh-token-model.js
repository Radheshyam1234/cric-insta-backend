const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RefreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const RefreshToken = mongoose.model(
  "RefreshToken",
  RefreshTokenSchema,
  "refresh-tokens"
);
module.exports = RefreshToken;
