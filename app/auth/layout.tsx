import type React from "react"
import { Inter } from "next/font/google"
import ClientOnly from "@/components/client-only"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "VibeFlow - Authentication",
  description: "Sign in or register for VibeFlow music streaming",
}

// Auth layout for auth routes
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-purple-950/30 to-black overflow-hidden">
      <ClientOnly>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="w-full">
              {children}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </ClientOnly>
    </div>
  )
} 