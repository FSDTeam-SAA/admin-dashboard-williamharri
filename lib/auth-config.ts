// app/api/auth/[...nextauth]/options.ts (or similar)
import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import { authAPI } from "@/lib/api"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:3000"

const decodeAccessTokenExpiry = (token: string) => {
  try {
    const [, payload] = token.split(".")
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString())
    if (decoded?.exp) {
      return decoded.exp * 1000
    }
  } catch {
    // ignore
  }
  return Date.now() + 15 * 60 * 1000
}

const refreshAccessToken = async (token: JWT) => {
  try {
    if (!token.refreshToken) {
      throw new Error("Missing refresh token")
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    })

    const json = await response.json()

    if (!response.ok || !json?.success) {
      throw new Error(json?.message || "Unable to refresh token")
    }

    const { data } = json
    const accessToken = data?.accessToken as string
    const refreshToken = data?.refreshToken || token.refreshToken

    return {
      ...token,
      accessToken,
      refreshToken,
      accessTokenExpires: decodeAccessTokenExpiry(accessToken),
      error: undefined,
    }
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password")
        }

        try {
          const response = await authAPI.login({
            email: credentials.email,
            password: credentials.password,
          })

          const { data, success, message } = response.data

          if (!success || !data) {
            throw new Error(message || "Invalid credentials")
          }

          const accessToken: string = data.accessToken
          const refreshToken: string = data.refreshToken
          const user = data.user

          return {
            id: data._id || user?.id,
            email: user?.email,
            name: user?.username || user?.name || user?.email,
            role: data.role || user?.role,
            accessToken,
            refreshToken,
            accessTokenExpires: decodeAccessTokenExpiry(accessToken),
            image: user?.avatarUrl || undefined,
          }
        } catch (error: any) {
          throw new Error(error?.response?.data?.message || error?.message || "Login failed")
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.refreshToken = (user as any).refreshToken
        token.role = (user as any).role
        token.accessTokenExpires = (user as any).accessTokenExpires
        return token
      }

      if (token.accessToken && token.accessTokenExpires) {
        const shouldRefresh = Date.now() >= (token.accessTokenExpires as number) - 5000
        if (!shouldRefresh) {
          return token
        }
      }

      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = (token.role as string) || "staff"
      }

      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      if (token.error) {
        session.error = token.error as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
