"use client"

import { useContext } from "react"
import { SplashContext } from "./splash-provider"

export function useSplash() {
  const context = useContext(SplashContext)
  
  if (!context) {
    throw new Error("useSplash must be used within a SplashProvider")
  }
  
  return context
} 