"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface UserData {
  progress: number
  badges: { id: string; name: string }[]
}

export default function UserData() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user.id) return

      const res = await fetch(`/api/user-data?userId=${session.user.id}`, {
        method: "GET", 
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        const data = await res.json()
        setUserData(data)
      } else {
        console.error("Failed to fetch user data")
      }
    }

    if (session) {
      fetchUserData()
    }
  }, [session]) // Trigger effect whenever session changes

  if (!session) {
    return <div>Please sign in to view your data.</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Data</h1>
      {userData ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Progress Bar with text displaying percentage */}
            <div className="mb-4">
              <Progress value={userData.progress} max={100} className="mb-2" />
              <div className="text-sm text-gray-600 text-center">
                {userData.progress.toFixed(1)}% Completed
              </div>
            </div>
            
            {/* Displaying Badges */}
            <div className="mb-2">Badges</div>
            <div className="flex gap-2 flex-wrap">
              {userData.badges.length > 0 ? (
                userData.badges.map((badge) => (
                  <div key={badge.id} className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm">
                    {badge.name}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No badges earned yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>Loading...</div> // Show loading message while data is being fetched
      )}
    </div>
  )
}
