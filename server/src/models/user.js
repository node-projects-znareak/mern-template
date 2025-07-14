const { Schema, model } = require("mongoose");
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "El e-mail es obligatorio"],
      maxLength: 100,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      minLength: 6,
      maxLength: 200,
      required: [true, "La contraseña es obligatoria"],
    },
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      minLength: 4,
      maxLength: 100,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = model("User", UserSchema);
