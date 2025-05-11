"use client"

import { ReactNode, createContext, useContext } from "react"
import { usePreferences } from "@/hooks/use-preferences"

// Create the context
const PreferencesContext = createContext<ReturnType<typeof usePreferences> | undefined>(undefined)

// Provider component
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const preferencesData = usePreferences()
  
  return (
    <PreferencesContext.Provider value={preferencesData}>
      {children}
    </PreferencesContext.Provider>
  )
}

// Context hook
export function usePreferencesContext() {
  const context = useContext(PreferencesContext)
  
  if (context === undefined) {
    throw new Error("usePreferencesContext must be used within a PreferencesProvider")
  }
  
  return context
} 