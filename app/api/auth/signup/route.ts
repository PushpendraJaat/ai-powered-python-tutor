import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/User"

export async function POST(req: Request) {
  try {
    const { name, email, password} = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    await dbConnect()
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = new User({ name, email, password: hashedPassword})
    const result = await user.save()

    if(!result) {
      return NextResponse.json({ error: "Error creating user" }, { status: 500 })
    }

    return NextResponse.json({ message: "User created successfully", userId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error in signup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

