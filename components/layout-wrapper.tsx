"use client"

import type React from "react"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Spinner } from "@/components/ui/spinner"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const isPlainRoute =
    pathname?.startsWith("/auth") || pathname === "/unauthorized"

  useEffect(() => {
    if (!isPlainRoute && status === "unauthenticated") {
      router.replace("/auth/login")
    }
  }, [isPlainRoute, status, router])

  if (isPlainRoute) {
    return <>{children}</>
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner className="text-gray-900" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        <main className="flex-1 mt-16 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
