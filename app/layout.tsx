import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import { getServerSession } from "next-auth/next"
import { SessionProvider } from "@/components/SessionProvider"
import Navigation from "@/components/Navigation"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AI-Powered Python Tutor for Kids",
  description: "Learn Python with fun, interactive lessons and a friendly AI tutor!",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
        <Navigation />
        <Toaster />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}

