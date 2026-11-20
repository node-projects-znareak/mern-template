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

// TTL index: MongoDB elimina el documento automáticamente cuando `expiresAt`
// pasa (el monitor TTL corre cada ~60 s). Es imprescindible porque CADA login
// y CADA rotación insertan un documento nuevo; sin este índice la colección
// crecería para siempre. El documento vive sus 7 días completos, lo que además
// permite la detección de reuso dentro de la ventana de gracia.
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Los queries de rotación/revocación filtran por usuario + estado de revocación;
// este compuesto cubre también los filtros solo por usuario (prefijo izquierdo),
// por lo que sustituye al índice simple sobre `user`.
RefreshTokenSchema.index({ user: 1, revokedAt: 1 });

export type RefreshToken = InferSchemaType<typeof RefreshTokenSchema> & { _id: Types.ObjectId };
export const RefreshTokenModel = model("RefreshToken", RefreshTokenSchema);
