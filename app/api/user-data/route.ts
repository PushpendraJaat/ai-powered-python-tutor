import dbConnect from "@/lib/dbConnect"
import { Progress, Badge } from "@/models/User"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
  
    }
  // Extract userId from query parameters
  const url = new URL(req.url)
  const userId = url.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }


  await dbConnect()
  try {
    const progress = await Progress.find({ userId })
    const badges = await Badge.find({ userId })

    const overallProgress =
      progress.length > 0 ? progress.reduce((acc, curr) => acc + curr.score, 0) / progress.length : 0

    return NextResponse.json({
      progress: overallProgress,
      badges: badges,
    })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
