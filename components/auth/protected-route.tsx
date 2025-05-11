"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [offline, setOffline] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    // Check if app is online
    const handleOnlineStatus = () => {
      setOffline(!navigator.onLine)
    }

    // Initial check
    setOffline(!navigator.onLine)

    // Listen for network status changes
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)

    return () => {
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
    }
  }, [])

  // Handle retrying when offline
  const handleRetry = () => {
    if (navigator.onLine) {
      setOffline(false)
      setRetry(prev => prev + 1)
    } else {
      setOffline(true)
    }
  }

  useEffect(() => {
    // Redirect when not authenticated
    if (!loading && !user && !offline) {
      router.push("/auth")
    }
  }, [user, loading, router, offline, retry])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (offline) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <Alert className="max-w-md bg-yellow-500/10 border-yellow-600">
          <WifiOff className="h-5 w-5 text-yellow-500" />
          <AlertTitle className="mb-2">Network Connection Error</AlertTitle>
          <AlertDescription className="text-sm">
            <p className="mb-4">You appear to be offline. Some features including authentication may not work properly.</p>
            <Button onClick={handleRetry} variant="outline" className="mt-2 gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return children
} 