"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, Menu, X } from "lucide-react";

export default function Navigation() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-lg font-bold">
            AI Python Tutor
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="sm:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden sm:flex space-x-8">
            <Link href="/" className="nav-link">Home</Link>
            {session && <Link href="/chat" className="nav-link">Chat</Link>}
            {session && <Link href="/user-data" className="nav-link">User Data</Link>}
            {session && <Link href="/settings" className="nav-link">Settings</Link>}
          </div>

          {/* Auth Links */}
          <div className="hidden sm:flex items-center">
            {session && (
              <Link href="/api/auth/signout" className="nav-link">Sign Out</Link>
            )}

            {!session && (
              <>
                <Link href="/auth/signin" className="nav-link m-10">Sign In</Link>
                <Link href="/auth/signup" className="nav-link">Sign Up</Link>
              </>
            )}

          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden px-4 pb-4 space-y-2 bg-white shadow-md">
          <Link href="/" className="block nav-link" onClick={() => setIsOpen(false)}>Home</Link>
          {session && <Link href="/chat" className="block nav-link" onClick={() => setIsOpen(false)}>Chat</Link>}
          {session && <Link href="/user-data" className="block nav-link" onClick={() => setIsOpen(false)}>User Data</Link>}
          {session && <Link href="/settings" className="block nav-link" onClick={() => setIsOpen(false)}>Settings</Link>}
          {session && (
            <Link href="/api/auth/signout" className="block nav-link" onClick={() => setIsOpen(false)}>Sign Out</Link>
          )}

          {!session && (
            <>
              <Link href="/auth/signin" className="block nav-link" onClick={() => setIsOpen(false)}>Sign In</Link>
              <Link href="/auth/signup" className="block nav-link" onClick={() => setIsOpen(false)}>Sign Up</Link>
            </>
          )}

        </div>
      )}
    </nav>
  );
}

