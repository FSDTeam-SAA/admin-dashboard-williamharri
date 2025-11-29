import type React from "react"
import { Poppins } from "next/font/google"
import { LayoutWrapper } from "@/components/layout-wrapper"
import "./globals.css"
import { Providers } from "./providers"

// Load Poppins globally
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="antialiased">
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}
