import { z } from "zod";

// Zod Schema for API Key Validation

export const apiKeySchema = z.object({
  apiKey: z
    .string()
    .min(20, "API Key must be at least 20 characters long")
    .max(100, "API Key is too long")
    .regex(/^AI[a-zA-Z0-9_-]+$/, "Invalid API Key format"), // Adjust as needed
});