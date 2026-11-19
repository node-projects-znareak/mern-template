import { type InferSchemaType, model, Schema, type Types } from "mongoose";

const RefreshTokenSchema = new Schema(
  {
    tokenHash: {
      type: String,
      required: [true, "Token hash is required"],
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
    revokedAt: {
      type: Date,
    },
    // Instante en que el token fue rotado: usado para permitir un período de gracia
    // en rotaciones concurrentes (varias pestañas refrescando a la vez).
    rotatedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export type RefreshToken = InferSchemaType<typeof RefreshTokenSchema> & { _id: Types.ObjectId };
export const RefreshTokenModel = model("RefreshToken", RefreshTokenSchema);
