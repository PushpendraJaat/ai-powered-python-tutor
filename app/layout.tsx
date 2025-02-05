"use client"

import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import { SessionProvider } from "next-auth/react";
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

  return (
    <html lang="en">
      <body className={inter.className}>
      <SessionProvider>
        <Navigation />
        <Toaster />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}

