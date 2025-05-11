"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"

type QualityLevel = "low" | "balanced" | "high" | "lossless"
type Theme = "light" | "dark" | "system"

interface SettingsContextType {
  streamingQuality: QualityLevel
  downloadQuality: QualityLevel
  theme: Theme
  autoplay: boolean
  crossfade: boolean
  crossfadeTime: number
  setStreamingQuality: (quality: QualityLevel) => void
  setDownloadQuality: (quality: QualityLevel) => void
  setTheme: (theme: Theme) => void
  setAutoplay: (autoplay: boolean) => void
  setCrossfade: (crossfade: boolean) => void
  setCrossfadeTime: (time: number) => void
  saveSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const isAuthenticated = !!user
  
  // Default settings based on authentication status
  const [streamingQuality, setStreamingQuality] = useState<QualityLevel>("low")
  const [downloadQuality, setDownloadQuality] = useState<QualityLevel>("low")
  const [theme, setTheme] = useState<Theme>("dark")
  const [autoplay, setAutoplay] = useState(true)
  const [crossfade, setCrossfade] = useState(true)
  const [crossfadeTime, setCrossfadeTime] = useState(3)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("userSettings")
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        
        // If user is authenticated, use saved settings
        if (isAuthenticated) {
          setStreamingQuality(parsedSettings.streamingQuality || "balanced")
          setDownloadQuality(parsedSettings.downloadQuality || "high")
        } else {
          // Force low quality for non-authenticated users
          setStreamingQuality("low")
          setDownloadQuality("low")
        }
        
        // These settings are applied regardless of authentication
        setTheme(parsedSettings.theme || "dark")
        setAutoplay(parsedSettings.autoplay !== undefined ? parsedSettings.autoplay : true)
        setCrossfade(parsedSettings.crossfade !== undefined ? parsedSettings.crossfade : true)
        setCrossfadeTime(parsedSettings.crossfadeTime || 3)
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }, [isAuthenticated])

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      const settings = {
        streamingQuality: isAuthenticated ? streamingQuality : "low",
        downloadQuality: isAuthenticated ? downloadQuality : "low",
        theme,
        autoplay,
        crossfade,
        crossfadeTime,
      }
      localStorage.setItem("userSettings", JSON.stringify(settings))
    } catch (error) {
      console.error("Failed to save settings:", error)
    }
  }

  // Auto-save settings when they change
  useEffect(() => {
    saveSettings()
  }, [streamingQuality, downloadQuality, theme, autoplay, crossfade, crossfadeTime, isAuthenticated])

  return (
    <SettingsContext.Provider
      value={{
        streamingQuality,
        downloadQuality,
        theme,
        autoplay,
        crossfade,
        crossfadeTime,
        setStreamingQuality,
        setDownloadQuality,
        setTheme,
        setAutoplay,
        setCrossfade,
        setCrossfadeTime,
        saveSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
} 