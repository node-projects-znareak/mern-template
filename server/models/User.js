const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
  name: { type: String, required: true, trim: true },
});

module.exports = model("User", UserSchema);
