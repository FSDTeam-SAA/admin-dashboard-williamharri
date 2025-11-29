"use client"

import { useMemo, useCallback } from "react"
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
import { Users, UserCheck, Briefcase, FileCheck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"

// --- Helper Function for Formatting Dates ---
const dateFormatter = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  // Format as "Nov 29" or "Oct 31"
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

export default function DashboardPage() {

  const session = useSession()
  const token = session.data?.accessToken
  const dashboardQuery = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: async () => {
      // ... (API call logic remains the same)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/jobs/dashboard/overview`
        , {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      const result = await response.json()
      return result.data
    },
  })

  const { data, isLoading } = dashboardQuery

  // --- Data Transformation for Charts ---

  const jobPostedData = useMemo(() => {
    if (!data?.jobGraph) return []
    
    const { labels, counts, dates } = data.jobGraph;
    
    // MODIFIED: Use the entire 30 days of data (no slicing)
    return labels.map((label: string, index: number) => ({
      name: dates[index], 
      value: counts[index] || 0,
    }))
  }, [data])

  const scaffoldActivityData = useMemo(() => {
    if (!data?.scaffoldGraph) return []

    // Zip labels and the 3 series arrays together
    return data.scaffoldGraph.labels.map((label: string, index: number) => ({
      name: label, // Use the full date string as the primary key
      submitted: data.scaffoldGraph.series.submitted[index] || 0,
      redo: data.scaffoldGraph.series.redo[index] || 0,
      accepted: data.scaffoldGraph.series.accepted[index] || 0,
    }))
  }, [data])
  
  // Custom Tooltip formatter for better display
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 border border-gray-200 bg-white shadow-lg rounded-lg text-sm">
          <p className="font-semibold text-gray-700 mb-1">{dateFormatter(label)}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} style={{ color: p.color }}>
              {`${p.name}: `}
              <span className="font-bold">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  }, []);

  // --- Card Value Extraction ---
  
  const cards = data?.cards || {}
  const totalStaff = cards.totalStaff || 0
  const totalManagers = cards.totalManagers || 0
  const totalJobs = cards.totalJobs || 0
  const totalScaffolded = cards.totalScaffoldedJobs || 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
      </div>

      {/* --- Stats Cards (Unchanged) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
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
                    <p className="text-gray-600 text-sm font-medium mb-2">Total Staff</p>
                    <p className="text-4xl font-bold text-gray-900">{totalStaff}</p>
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
                    <p className="text-4xl font-bold text-gray-900">{totalManagers}</p>
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

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-2">Scaffold Jobs</p>
                    <p className="text-4xl font-bold text-gray-900">{totalScaffolded}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileCheck className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      ---
      
      {/* --- Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Job Posted Chart */}
        <Card>
          <CardHeader>
            {/* UPDATED: Title now reflects the 30 days of data used */}
            <CardTitle>Job Posted (Last 30 Days)</CardTitle> 
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobPostedData}>
                <CartesianGrid strokeDasharray="3 3" />
                {/* Date formatter applied */}
                <XAxis dataKey="name" tickFormatter={dateFormatter} /> 
                <YAxis allowDecimals={false} />
                <Tooltip content={CustomTooltip} />
                <Bar dataKey="value" fill="#1f2937" name="Jobs" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scaffold Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Scaffold Activity (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scaffoldActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                {/* Date formatter applied */}
                <XAxis dataKey="name" tickFormatter={dateFormatter} />
                <YAxis allowDecimals={false} />
                <Tooltip content={CustomTooltip} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="submitted" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Submitted" 
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="redo" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Redo" 
                  dot={{ r: 4 }}
                />
                 <Line 
                  type="monotone" 
                  dataKey="accepted" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Accepted" 
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}