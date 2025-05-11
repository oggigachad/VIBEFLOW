"use client"

import React, { createContext, useState, useCallback, ReactNode } from "react"

export interface SplashContextType {
  isVisible: boolean
  message: string
  showSplash: (message: string) => void
  hideSplash: () => void
}

export const SplashContext = createContext<SplashContextType | null>(null)

interface SplashProviderProps {
  children: ReactNode
}

export function SplashProvider({ children }: SplashProviderProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState("")
  
  // Automatically hide splash after 2 seconds
  const showSplash = useCallback((message: string) => {
    setMessage(message)
    setIsVisible(true)
    
    // Auto-hide after 2 seconds
    setTimeout(() => {
      setIsVisible(false)
    }, 2000)
  }, [])
  
  const hideSplash = useCallback(() => {
    setIsVisible(false)
  }, [])
  
  return (
    <SplashContext.Provider
      value={{
        isVisible,
        message,
        showSplash,
        hideSplash
      }}
    >
      {children}
    </SplashContext.Provider>
  )
} 