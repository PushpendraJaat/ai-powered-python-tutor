import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Custom404() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="mt-4 text-xl text-gray-600">Sorry, we couldn’t find this page.</p>
        <Button className="mt-8">
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    )
  }
  