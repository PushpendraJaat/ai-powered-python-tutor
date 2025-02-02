import dbConnect from "@/lib/dbConnect";
import { Progress } from "@/models/User";
import { Badge } from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, progress, badge } = await req.json();

    // Ensure at least one of progress or badge is provided
    if (!userId || (!progress && !badge)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    const updateOperations: Promise<any>[] = [];

    if (progress) {
      updateOperations.push(
        Progress.updateOne(
          { userId, lesson: progress.lesson },
          { $set: { completed: progress.completed, score: progress.score } },
          { upsert: true }
        )
      );
    }

    if (badge) {
      updateOperations.push(
        Badge.updateOne(
          { userId, name: badge.name },
          { $set: {} }, // Fix: Ensure MongoDB knows something is being updated
          { upsert: true }
        )
      );
    }

    const results = await Promise.all(updateOperations);
    const responseMessages: string[] = [];

    if (progress) {
      const { modifiedCount, upsertedCount } = results[0];
      responseMessages.push(
        upsertedCount ? "Progress created" : modifiedCount ? "Progress updated" : "No changes made"
      );
    }

    if (badge) {
      const { modifiedCount, upsertedCount } = results.length > 1 ? results[1] : results[0];
      responseMessages.push(
        upsertedCount ? "Badge created" : modifiedCount ? "Badge updated" : "No changes made"
      );
    }

    return NextResponse.json({ message: responseMessages.join(", ") }, { status: 200 });
  } catch (error) {
    console.error("Database update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
