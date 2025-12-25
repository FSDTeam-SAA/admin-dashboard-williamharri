import axios, { type AxiosInstance } from "axios"
import { getSession, signOut } from "next-auth/react"

const API_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:3000"

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

let refreshPromise: ReturnType<typeof getSession> | null = null

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const session = await getSession()
      const accessToken = session?.accessToken

      if (accessToken) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (typeof window === "undefined") return Promise.reject(error)

    const originalRequest = error.config as (typeof error.config & {
      _retry?: boolean
    })

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      if (!refreshPromise) refreshPromise = getSession()
      const session = await refreshPromise
      refreshPromise = null

      const accessToken = session?.accessToken
      if (session?.error === "RefreshAccessTokenError" || !accessToken) {
        await signOut({ callbackUrl: "/login" })
        return Promise.reject(error)
      }

      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return axiosInstance(originalRequest)
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
