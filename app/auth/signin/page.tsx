"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signInSchema } from "@/schemas/signinSchema"
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loader, setLoader] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoader(true)
    setError(null)

    // Validate input with Zod
    const parseResult = signInSchema.safeParse({ email, password })
    if (!parseResult.success) {
      setLoader(false)
      setError(parseResult.error.errors[0].message)
      return
    }

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.ok) {
        setLoader(false)
        // Force full page reload to ensure session is loaded
        router.push("/chat")

      } else {
        setLoader(false)
        setError(result?.error || "Sign in failed")
        console.error("Sign in failed:", result?.error)
      }
    } catch (error) {
      setLoader(false)
      console.error("An unexpected error occurred:", error)
      setError("An unexpected error occurred.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-400 to-blue-500 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <CardFooter className="px-0 pt-4">
              <Button type="submit" className="w-full" disabled={loader}>
                {loader ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}