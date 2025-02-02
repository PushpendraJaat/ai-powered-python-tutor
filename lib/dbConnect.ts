import mongoose from "mongoose"

type ConnectionObject = {
  isConnected?: number
}

const connection: ConnectionObject = {}

const dbConnect = async (): Promise<void> => {
  // checking if db connection already exists.
  if (connection.isConnected) {
    console.log("Already connected")
    return
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {
      dbName: process.env.DB_NAME,
    })
    connection.isConnected = db.connections[0].readyState
    console.log("db connected")
  } catch (error) {
    console.log("db connection failed", error)
    process.exit(1)
  }
}

export default dbConnect

