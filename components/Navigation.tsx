"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navigation() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              AI Python Tutor
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              {session && (
                <Link
                  href="/chat"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Chat
                </Link>
              )}
              {session && (
                <Link
                  href="/user-data"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  User Data
                </Link>
              )}
              {session && (
                <Link
                  href="/settings"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Settings
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {status === "loading" ? null : session ? (
              <Link
                href="/api/auth/signout"
                className="text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-gray-500 hover:text-gray-700 mr-4"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
