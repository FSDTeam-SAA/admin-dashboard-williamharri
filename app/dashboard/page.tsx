"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Briefcase } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { userAPI, jobsAPI } from "@/lib/api"

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function DashboardPage() {
  const usersQuery = useQuery({
    queryKey: ["dashboard", "users"],
    queryFn: async () => {
      const response = await userAPI.getAllUsers(1, 100)
      return response.data.data
    },
  })

  const jobsQuery = useQuery({
    queryKey: ["dashboard", "jobs"],
    queryFn: async () => {
      const response = await jobsAPI.getAllJobs(1, 50)
      return response.data.data
    },
  })

  const totalUsers = usersQuery.data?.pagination?.totalDocs ?? 0
  const staffCount =
    usersQuery.data?.results?.filter((user: any) => user.role === "staff").length ?? 0
  const managerCount =
    usersQuery.data?.results?.filter((user: any) => user.role === "manager").length ?? 0
  const totalJobs = jobsQuery.data?.pagination?.totalDocs ?? 0

  const jobPostedData = useMemo(() => {
    const jobs = jobsQuery.data?.results ?? []
    const counts: Record<string, number> = {}

    jobs.forEach((job: any) => {
      if (!job.createdAt) return
      const dayName = dayLabels[new Date(job.createdAt).getDay()]
      counts[dayName] = (counts[dayName] || 0) + 1
    })

    return dayLabels.map((day) => ({
      name: day,
      value: counts[day] ?? 0,
    }))
  }, [jobsQuery.data])

  const userGrowthData = useMemo(() => {
    const users = usersQuery.data?.results ?? []
    const jobs = jobsQuery.data?.results ?? []

    const buildDateKey = (dateString: string) => {
      const date = new Date(dateString)
      if (Number.isNaN(date.getTime())) return null
      return date.toISOString().split("T")[0]
    }

    const aggregateByDate = (items: any[]) => {
      return items.reduce<Record<string, number>>((acc, item) => {
        if (!item.createdAt) return acc
        const key = buildDateKey(item.createdAt)
        if (!key) return acc
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
    }

    const usersByDate = aggregateByDate(users)
    const jobsByDate = aggregateByDate(jobs)

    const lastSevenDays = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      const key = date.toISOString().split("T")[0]
      const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      return { key, label }
    })

    return lastSevenDays.map((day) => ({
      name: day.label,
      value1: usersByDate[day.key] ?? 0,
      value2: jobsByDate[day.key] ?? 0,
      value3: 0,
    }))
  }, [usersQuery.data, jobsQuery.data])

  const isLoading = usersQuery.isLoading || jobsQuery.isLoading

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-2">Total Users</p>
                    <p className="text-4xl font-bold text-gray-900">{totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-2">Managers</p>
                    <p className="text-4xl font-bold text-gray-900">{managerCount}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-2">Jobs Posted</p>
                    <p className="text-4xl font-bold text-gray-900">{totalJobs}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Briefcase className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Posted</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobPostedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1f2937" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User & Job Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value1" stroke="#ef4444" name="New Users" />
                <Line type="monotone" dataKey="value2" stroke="#3b82f6" name="New Jobs" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
