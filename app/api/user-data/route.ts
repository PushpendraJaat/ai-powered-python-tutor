import dbConnect from "@/lib/dbConnect"
import { Progress, Badge } from "@/models/User"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  // Extract userId from query parameters
  const url = new URL(req.url)
  const userId = url.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  const session = await getServerSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
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
