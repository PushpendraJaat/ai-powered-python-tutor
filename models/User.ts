import mongoose from "mongoose"
import { z } from "zod"

// Zod schema for validation
export const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
})

// MongoDB schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
)

export const User = mongoose.models.User || mongoose.model("User", userSchema)

// Zod schema for validation
export const ProgressSchema = z.object({
  userId: z.string(),
  lesson: z.string(),
  completed: z.boolean(),
  score: z.number().min(0).max(100),
})

// MongoDB schema
const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lesson: { type: String, required: true },
    completed: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const Progress = mongoose.models.Progress || mongoose.model("Progress", progressSchema)

// Zod schema for validation
export const BadgeSchema = z.object({
  userId: z.string(),
  name: z.string(),
})

// MongoDB schema
const badgeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
  },
  { timestamps: true },
)

export const Badge = mongoose.models.Badge || mongoose.model("Badge", badgeSchema)

