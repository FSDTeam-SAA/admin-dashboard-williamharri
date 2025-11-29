"use client"

import type React from "react"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { authAPI } from "@/lib/api"

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [otp, setOtp] = useState("")

  const verifyOtpMutation = useMutation({
    mutationFn: (payload: { email: string; otp: string }) =>
      authAPI.verifyResetOtp(payload),
    onSuccess: (_data, variables) => {
      toast.success("OTP verified successfully")
      router.push(
        `/auth/reset-password?email=${encodeURIComponent(variables.email)}&otp=${variables.otp}`,
      )
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Invalid OTP")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    verifyOtpMutation.mutate({ email, otp })
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</h1>
      <p className="text-gray-500 mb-8">
        We have share a code of your registered email address <br />
        {email}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Enter 6-digit OTP</label>
          <Input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.slice(0, 6))}
            required
            maxLength={6}
            className="h-12 text-center text-2xl tracking-widest"
          />
        </div>

        <Button
          type="submit"
          disabled={verifyOtpMutation.isPending || otp.length !== 6}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
        >
          {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </div>
  )
}
