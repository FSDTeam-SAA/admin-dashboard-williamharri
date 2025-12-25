"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userAPI } from "@/lib/api"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface User {
  id: string
  name?: string
  email: string
  username: string
  role: string
  phone?: string
  avatarUrl?: string
  status: string
  uniqueId: string
}

interface PaginationData {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export function UserTable() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const limit = 20

  // ✅ Search state (by name / username)
  const [search, setSearch] = useState("")

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", page],
    queryFn: async () => {
      const response = await userAPI.getAllUsers(page, limit)
      return response.data.data
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => userAPI.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User role updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update role")
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userAPI.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete user")
    },
  })

  const users: User[] = data?.results || []
  const pagination: PaginationData = data?.pagination || {
    page: 1,
    limit: 20,
    totalDocs: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  }

  // ✅ Filter users by name (fallback to username)
  const filteredUsers = users.filter((user) => {
    const name = (user.name || user.username || "").toLowerCase()
    return name.includes(search.trim().toLowerCase())
  })

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">Error loading users</div>
  }

  return (
    <div className="space-y-4">
      {/* ✅ Search Bar */}
      <div className="flex items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="max-w-sm"
        />
        {search && (
          <Button variant="outline" onClick={() => setSearch("")}>
            Clear
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-10 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              : filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {(user.name || user.username || "U")
                              .split(" ")
                              .filter(Boolean)
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name || user.username}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-gray-600">{user.email}</TableCell>

                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => {
                          updateRoleMutation.mutate({
                            userId: user.id,
                            role: value,
                          })
                        }}
                        disabled={updateRoleMutation.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {user.status}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-gray-600">{user.uniqueId}</TableCell>

                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                          </AlertDialogDescription>
                          <div className="flex justify-end gap-3">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              disabled={deleteUserMutation.isPending}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.totalDocs)} of {pagination.totalDocs} results
        </span>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPage(page - 1)} disabled={!pagination.hasPrev}>
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.totalPages }).map((_, i) => (
              <Button
                key={i + 1}
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button variant="outline" onClick={() => setPage(page + 1)} disabled={!pagination.hasNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
