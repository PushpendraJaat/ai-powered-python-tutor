import mongoose from "mongoose";
import { z } from "zod";

// Zod Schema for Validation
const messageSchemaZod = z.object({
  userId: z.string().min(3, "User ID is required"),
  tutorName: z.string().min(3, "Tutor name is required"),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1, "Message content cannot be empty"),
      timestamp: z.date().optional(), // Optional since MongoDB auto-generates it
    })
  ),
});

// Mongoose Schema
const messageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  tutorName: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

messageSchema.index({ userId: 1, tutorName: 1 }, { unique: true });
// Ensure model is created only once
const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

export { Message, messageSchemaZod };
