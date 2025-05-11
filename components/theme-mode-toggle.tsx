"use client"

import React, { useState, useEffect } from "react"
import { Moon, Sun, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type ColorMode = "default" | "purple" | "blue" | "green" | "amber"
const LOCAL_STORAGE_KEY = "vibeflow-color-mode"

export function ThemeModeToggle() {
  const [mounted, setMounted] = useState(false)
  const [currentMode, setCurrentMode] = useState<ColorMode>("default")
  const [showModes, setShowModes] = useState(false)
  const { setTheme, theme } = useTheme()
  
  // Load saved color mode and set mounted state
  useEffect(() => {
    // Get saved mode from localStorage
    const savedMode = localStorage.getItem(LOCAL_STORAGE_KEY) as ColorMode | null
    if (savedMode && ["default", "purple", "blue", "green", "amber"].includes(savedMode)) {
      setCurrentMode(savedMode)
    }
    
    // Set mounted state to enable client-side rendering
    setMounted(true)
    
    // Always ensure dark mode is set
    setTheme("dark")
  }, [setTheme])
  
  // Apply the theme color classes to the document element
  useEffect(() => {
    if (!mounted) return
    
    const documentEl = document.documentElement
    
    // Always ensure dark class is present
    documentEl.classList.add('dark')
    
    // Remove any existing color mode classes
    documentEl.classList.remove(
      "theme-default",
      "theme-purple", 
      "theme-blue", 
      "theme-green", 
      "theme-amber"
    )
    
    // Add the current color mode class
    documentEl.classList.add(`theme-${currentMode}`)
    
    // Save to localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, currentMode)
    
    // Always ensure dark mode is set again after class changes
    if (theme !== 'dark') {
      setTheme("dark")
    }
  }, [currentMode, setTheme, mounted, theme])
  
  // Color mode configurations
  const colorModes: Record<ColorMode, { bg: string, icon: React.ReactNode, accent: string }> = {
    default: { 
      bg: "bg-gradient-to-r from-violet-500/20 to-purple-500/20", 
      icon: <Moon className="h-4 w-4" />,
      accent: "purple"
    },
    purple: { 
      bg: "bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20", 
      icon: <Palette className="h-4 w-4 text-pink-400" />,
      accent: "pink" 
    },
    blue: { 
      bg: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20", 
      icon: <Palette className="h-4 w-4 text-cyan-400" />,
      accent: "cyan"
    },
    green: { 
      bg: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20", 
      icon: <Palette className="h-4 w-4 text-emerald-400" />,
      accent: "emerald" 
    },
    amber: { 
      bg: "bg-gradient-to-r from-amber-500/20 to-orange-500/20", 
      icon: <Palette className="h-4 w-4 text-amber-400" />,
      accent: "amber"
    }
  }
  
  const toggleModeSelector = () => {
    setShowModes(!showModes)
  }
  
  const selectMode = (mode: ColorMode) => {
    setCurrentMode(mode)
    setShowModes(false)
    
    // Always ensure dark mode is set whenever changing color modes
    if (theme !== 'dark') {
      setTheme("dark")
    }
    
    // Apply a splash effect
    const splash = document.createElement("div")
    splash.className = `fixed inset-0 z-[100] pointer-events-none bg-${colorModes[mode].accent}-500/5`
    document.body.appendChild(splash)
    
    setTimeout(() => {
      splash.className = `fixed inset-0 z-[100] pointer-events-none bg-${colorModes[mode].accent}-500/0 transition-all duration-1000`
      setTimeout(() => {
        document.body.removeChild(splash)
      }, 1000)
    }, 50)
  }
  
  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) return null
  
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleModeSelector}
        className={cn("relative", showModes && "bg-muted")}
      >
        {colorModes[currentMode].icon}
      </Button>
      
      <AnimatePresence>
        {showModes && (
          <motion.div 
            className="absolute right-0 mt-2 py-2 w-36 rounded-md shadow-lg bg-card border border-border z-50"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {(Object.keys(colorModes) as ColorMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => selectMode(mode)}
                className={cn(
                  "flex items-center w-full px-4 py-2 text-sm hover:bg-muted/50 transition-colors",
                  mode === currentMode && "bg-muted"
                )}
              >
                <div className={cn("w-4 h-4 rounded-full mr-2", colorModes[mode].bg)} />
                <span className="capitalize">{mode}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 