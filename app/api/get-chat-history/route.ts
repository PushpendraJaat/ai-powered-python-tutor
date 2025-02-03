import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Message } from "@/models/Messages";
import { z } from "zod";
import { RateLimiterMemory } from "rate-limiter-flexible";



const querySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  tutorName: z.string().min(1, "Tutor name is required")
});

const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

export async function GET(request: Request) {
  await dbConnect(); // Ensure DB is connected

  const clientIP = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  try {
    await rateLimiter.consume(clientIP);
  } catch {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      userId: searchParams.get("userId"),
      tutorName: searchParams.get("tutorName"),
    };
    
    const validatedQuery = querySchema.parse(queryParams);
    if (!validatedQuery) {
      return NextResponse.json(
        { message: "invalid query params" },
        { status: 400 }
      );
    }

    const chatHistory = await Message.findOne(
      {
        userId: validatedQuery.userId,
        tutorName: validatedQuery.tutorName,
      },
      { messages: 1, createdAt: 1, lastUpdated: 1, _id: 0 }
    ).lean() as { messages: any[], createdAt: Date, lastUpdated: Date } | null;

    if (!chatHistory) {
      return NextResponse.json(
        {
          message: "No chat history found",
          data: { messages: [], meta: { createdAt: new Date(), lastUpdated: new Date() } },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "Chat history retrieved successfully",
        data: {
          messages: chatHistory.messages,
          meta: {
            createdAt: chatHistory.createdAt,
            lastUpdated: chatHistory.lastUpdated,
          },
        },
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
          "CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid query parameters", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Database error:", error);
    return NextResponse.json(
      { message: "Error retrieving chat history" },
      { status: 500 }
    );
  }
}
