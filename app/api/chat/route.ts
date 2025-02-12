import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import Setting from "@/models/Setting";
import { Message } from "@/models/Messages";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// ----------------------
// Request validation schemas
// ----------------------
const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const ChatRequestSchema = z.object({
  userId: z.string(),
  messages: z.array(MessageSchema),
  tutorName: z.string().default("Python Teacher"),
  tutorGreeting: z.string().default(""),
  tutorStyle: z.string().default(""),
});

// ----------------------
// Rate limiter configuration 
// ----------------------
const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests per duration
  duration: 60, // 60 seconds
});

// ----------------------
// Caching Gemini API Key
// ----------------------
let cachedGeminiAPIKey: string | null = null;
async function getGeminiAPIKey(): Promise<string> {
  if (cachedGeminiAPIKey) return cachedGeminiAPIKey;
  const GeminiAPI = await Setting.findOne({ key: "gemini_api_key" });
  if (!GeminiAPI || !GeminiAPI.value) {
    throw new Error("Gemini API key not found");
  }
  cachedGeminiAPIKey = GeminiAPI.value;
  return cachedGeminiAPIKey as string;
}

// ----------------------
// Main API handler
// ----------------------
export async function POST(req: Request) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Ensure DB connection is established (with pooling/reuse)
    await dbConnect();

    // Start reading the JSON body and perform rate limiting concurrently.
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    const bodyPromise = req.json();
    const rateLimitPromise = rateLimiter.consume(clientIP).catch(() => null);

    const rateLimitResult = await rateLimitPromise;
    if (!rateLimitResult) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse and validate the request body
    const body = await bodyPromise;
    const { userId, messages, tutorName, tutorGreeting, tutorStyle } =
      ChatRequestSchema.parse(body);

    // ----------------------
    // Save/Update Chat History in DB BEFORE generating a reply
    // ----------------------
    const saveResult = await Message.findOneAndUpdate(
      { userId, tutorName },
      {
        $set: {
          messages,
          lastUpdated: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        rawResult: true,
      }
    );

    if (!saveResult) {
      return NextResponse.json(
        { error: "Failed to create or update chat history" },
        { status: 500 }
      );
    }

    // ----------------------
    // Generate Assistant Reply Using Google Generative AI
    // ----------------------
    // Retrieve the Gemini API key from cache or DB
    const geminiApiKey = await getGeminiAPIKey();

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Ensure the conversation starts with a user message.
    const validHistory =
      messages.length > 0 && messages[0].role !== "user"
        ? messages.slice(1)
        : messages;

    if (!validHistory.length || validHistory[validHistory.length - 1].role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    // Extract the last user message
    const lastUserMessage = validHistory[validHistory.length - 1].content;

    // Compose teacher instructions to guide the assistant
    const teacherInstructions = `
ROLE: ${tutorName}
GREETING: ${tutorGreeting}
STYLE: ${tutorStyle}
TASK: Teach Python to children using simple language, fun examples, and engaging explanations.
RESPONSE FORMAT:
- For correct answers: Include "That's correct!" and add 3 emojis
- For code challenges: Use format "CHALLENGE:[task description]\nEXPECTED OUTPUT:[expected result]"
`;

    // Map history into the format expected by the generative model
    const chatHistory = validHistory.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Start a chat session with the provided history and configuration
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.5,
      },
    });

    // Send the concatenated instructions and last user message
    let responseText: string;
    try {
      const result = await chat.sendMessage(teacherInstructions + lastUserMessage);
      responseText = (await result.response.text()).trim();
    } catch (apiError) {
      console.error("Error from Generative AI:", apiError);
      return NextResponse.json(
        { error: "Error generating assistant reply" },
        { status: 500 }
      );
    }

    // ----------------------
    // Process the response for any special triggers
    // ----------------------
    const responseData: {
      content: string;
      correct?: boolean;
      challenge?: string;
      expectedOutput?: string;
    } = { content: responseText };

    if (responseText.includes("That's correct!")) {
      responseData.correct = true;
    }
    const challengeMatch = responseText.match(/CHALLENGE:(.*?)\nEXPECTED OUTPUT:(.*)/s);
    if (challengeMatch) {
      responseData.challenge = challengeMatch[1].trim();
      responseData.expectedOutput = challengeMatch[2].trim();
      // Remove challenge details from the content if present
      responseData.content = responseText.replace(/CHALLENGE:.*$/s, "").trim();
    }

    // ----------------------
    // Update Chat History in DB with the Assistant's Reply
    // ----------------------
    const updatedMessages = [
      ...messages,
      { role: "assistant", content: responseData.content, id: uuidv4() },
    ];

    await Message.findOneAndUpdate(
      { userId, tutorName },
      {
        $set: {
          messages: updatedMessages,
          lastUpdated: new Date(),
        },
      }
    );

    // Return the assistant's reply (and any additional response data)
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("API Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
