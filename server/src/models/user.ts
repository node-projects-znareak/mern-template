import { type InferSchemaType, model, Schema, type Types } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      maxlength: 100,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      maxlength: 200,
      required: [true, "Password is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: 4,
      maxlength: 100,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof UserSchema> & { _id: Types.ObjectId };
export type PublicUser = Omit<User, "password">;

export const UserModel = model("User", UserSchema);
