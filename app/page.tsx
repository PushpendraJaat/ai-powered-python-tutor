import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 to-blue-500 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-4">AI-Powered Python Tutor for Kids</h1>
      <p className="text-white text-center max-w-2xl mb-8">
        Welcome to our fun and interactive Python learning adventure! Our AI-powered tutor is here to make learning
        Python exciting and easy for kids aged 8-14. With colorful lessons, friendly AI characters, and interactive
        challenges, you'll be coding like a pro in no time!
      </p>
      <p className="text-white text-center max-w-2xl mb-8">
        Choose your favorite AI tutor character, complete engaging lessons, earn cool badges, and track your progress as
        you explore the world of Python programming. Get ready for an amazing coding journey!
      </p>
      <Link href="/chat">
        <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
          Start Learning!
        </Button>
      </Link>
    </div>
  )
}

