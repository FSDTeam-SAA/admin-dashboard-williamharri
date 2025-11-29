"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ErrorPage() {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-bold text-red-600">Authentication Error</h1>
      <p className="text-gray-600">There was an error during authentication. Please try again.</p>
      <Link href="/login">
        <Button className="bg-blue-600 hover:bg-blue-700">Back to Login</Button>
      </Link>
    </div>
  )
}
