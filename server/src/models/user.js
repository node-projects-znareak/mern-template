const { Schema, model } = require("mongoose");
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      maxLength: 100,
      trim: true,
    },
    password: {
      type: String,
      minLength: 6,
      maxLength: 200,
      required: [true, "Password is required"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      minLength: 4,
      maxLength: 100,
      trim: true,
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });

module.exports = model("User", UserSchema);
