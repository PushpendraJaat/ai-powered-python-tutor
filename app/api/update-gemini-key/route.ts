import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import dbConnect from "@/lib/dbConnect";
import Setting from "@/models/Setting";

export async function POST(req: Request) {
    if (req.method !== "POST") {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const session = await getServerSession();
    console.log(session);
    

    if (!session ) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { apiKey } = await req.json();
    if (!apiKey) {
        return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }
    console.log(apiKey);
    

    try {
        await dbConnect();

        // 🔐 Store API Key Securely in Database
        const result = await Setting.findOneAndUpdate(
            { key: "gemini_api_key" },
            { value: apiKey },
            { upsert: true }
        );
        console.log(result);
        
        if(!result){
            return NextResponse.json({ message: "Error while updating database"}, {status: 400})
        }

        return NextResponse.json({ message: "API key updated" }, { status: 200 });
    } catch (error) {
        console.error("Error updating API key:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
