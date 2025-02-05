import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Setting from "@/models/Setting";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });

  }
  
    if (req.method !== "POST") {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const { apiKey } = await req.json();
    if (!apiKey) {
        return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    try {
        await dbConnect();

        // 🔐 Store API Key Securely in Database
        const result = await Setting.findOneAndUpdate(
            { key: "gemini_api_key" },
            { value: apiKey },
            { upsert: true }
        );
        
        if(!result){
            return NextResponse.json({ message: "Error while updating database"}, {status: 400})
        }

        return NextResponse.json({ message: "API key updated" }, { status: 200 });
    } catch (error) {
        console.error("Error updating API key:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
