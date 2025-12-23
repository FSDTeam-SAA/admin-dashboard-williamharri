"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { authAPI } from "@/lib/api"

export function Header() {
  const { data: session } = useSession()

  const [open, setOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const changePasswordMutation = useMutation({
    mutationFn: (payload: { oldPassword: string; newPassword: string }) =>
      authAPI.changePassword(payload),
    onSuccess: () => {
      toast.success("Password changed successfully.")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setOpen(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to change password")
    },
  })

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields.")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.")
      return
    }

    changePasswordMutation.mutate({
      oldPassword,
      newPassword,
    })
  }

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-50">
        <div className="flex-1" />

        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200 cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-xs text-gray-500">@{session?.user?.role}</p>
            </div>
            <Avatar>
              <AvatarImage src={session?.user?.image || "/placeholder.svg"} />
              <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="relative">
              <Input
                type={showOld ? "text" : "password"}
                placeholder="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500"
                onClick={() => setShowOld(!showOld)}
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? "Saving..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
