import mongoose, { Schema, Document } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: string;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: {
      type: String,
      required: [true, "Key is required"],
      unique: true,
      enum: ["gemini_api_key"], // Restrict to specific keys
    },
    value: {
      type: String,
      required: [true, "Value is required"],
      minlength: [20, "API key must be at least 20 characters long"],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);
