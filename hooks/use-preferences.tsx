"use client"

import { useState, useEffect } from "react"

// Define the types for user preferences
export interface UserPreferences {
  // Player preferences
  volume: number
  isMuted: boolean
  isRepeating: boolean
  isShuffling: boolean
  
  // Visualizer preferences
  visualizerType: "bars" | "wave" | "circles"
  colorScheme: string
  showVisualizer: boolean
  
  // Equalizer preferences
  equalizerPreset: string
  equalizerValues: number[]
  showEqualizer: boolean
  
  // UI preferences
  isMinimized: boolean
  isDarkMode: boolean
  activePanel: "lyrics" | "info" | "visualizer"
  
  // New preferences
  equalizer: number[]
  isEqualizerEnabled: boolean
  reverbLevel: number
  bassBoost: number
  clarity: number
  spatialEffect: number
  theme: "light" | "dark" | "system"
  crossfadeDuration: number
  visualizerStyle: string
  visualizerSensitivity: number
  defaultLyricsVisible: boolean
  defaultQueueVisible: boolean
}

// Default preferences
export const defaultPreferences: UserPreferences = {
  volume: 80,
  isMuted: false,
  isRepeating: false,
  isShuffling: false,
  
  visualizerType: "bars",
  colorScheme: "purple",
  showVisualizer: false,
  
  equalizerPreset: "flat",
  equalizerValues: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  showEqualizer: false,
  
  isMinimized: false,
  isDarkMode: true,
  activePanel: "lyrics",
  
  equalizer: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  isEqualizerEnabled: false,
  reverbLevel: 0,
  bassBoost: 0,
  clarity: 0,
  spatialEffect: 0,
  theme: "dark",
  crossfadeDuration: 2,
  visualizerStyle: "bars",
  visualizerSensitivity: 50,
  defaultLyricsVisible: true,
  defaultQueueVisible: false
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [initialized, setInitialized] = useState(false)
  
  // Load preferences from localStorage on initial render
  useEffect(() => {
    const storedPreferences = typeof window !== "undefined" 
      ? localStorage.getItem("userPreferences") 
      : null
      
    if (storedPreferences) {
      try {
        const parsedPreferences = JSON.parse(storedPreferences)
        setPreferences((currentPreferences) => ({
          ...currentPreferences,
          ...parsedPreferences
        }))
      } catch (error) {
        console.error("Error parsing stored preferences:", error)
      }
    }
    
    setInitialized(true)
  }, [])
  
  // Save preferences to localStorage when they change
  useEffect(() => {
    if (initialized && typeof window !== "undefined") {
      localStorage.setItem("userPreferences", JSON.stringify(preferences))
    }
  }, [preferences, initialized])
  
  // Update preferences
  const updatePreferences = (updatedPreferences: Partial<UserPreferences>) => {
    // Check if any values are actually different before updating state
    setPreferences((currentPreferences) => {
      // Check if any of the values actually changed
      const hasChanges = Object.entries(updatedPreferences).some(
        ([key, value]) => currentPreferences[key as keyof UserPreferences] !== value
      );
      
      // Only update if something actually changed
      if (hasChanges) {
        return {
          ...currentPreferences,
          ...updatedPreferences
        };
      }
      
      // Return the current preferences unchanged if nothing changed
      return currentPreferences;
    });
  }
  
  // Reset preferences to defaults
  const resetPreferences = () => {
    setPreferences(defaultPreferences)
  }
  
  return {
    preferences,
    updatePreferences,
    resetPreferences
  }
} 