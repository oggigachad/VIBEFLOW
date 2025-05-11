"use client"

import { useState, useEffect } from "react"
import { usePreferencesContext } from "@/context/preferences-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCcw, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { UserPreferences } from "@/hooks/use-preferences"

export default function SettingsPage() {
  const { preferences, updatePreferences, resetPreferences } = usePreferencesContext()
  const [hasChanges, setHasChanges] = useState(false)

  // Local state for settings
  const [localSettings, setLocalSettings] = useState<UserPreferences>(preferences)

  // Update local settings when preferences load or change
  useEffect(() => {
    setLocalSettings(preferences)
  }, [preferences])

  // Apply changes
  const applyChanges = () => {
    // Update all preferences at once
    updatePreferences(localSettings)
    
    setHasChanges(false)
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    })
  }

  // Reset all settings
  const handleReset = () => {
    resetPreferences()
    toast({
      title: "Settings reset",
      description: "All preferences have been reset to defaults.",
    })
  }

  // Handle setting changes
  const handleSettingChange = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setLocalSettings((prev: UserPreferences) => ({
      ...prev,
      [key]: value
    }))
    setHasChanges(true)
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-4xl py-10 pb-24">
        <Toaster />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-400">Customize your music player experience</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset All
            </Button>
            <Button 
              onClick={applyChanges} 
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="player">
          <TabsList className="mb-6">
            <TabsTrigger value="player">Player</TabsTrigger>
            <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
            <TabsTrigger value="equalizer">Equalizer</TabsTrigger>
            <TabsTrigger value="interface">Interface</TabsTrigger>
          </TabsList>

          <TabsContent value="player">
            <Card>
              <CardHeader>
                <CardTitle>Player Settings</CardTitle>
                <CardDescription>Configure how the music player behaves</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="default-volume">Default Volume</Label>
                    <p className="text-sm text-gray-400">Set the default volume level</p>
                  </div>
                  <div className="w-1/3">
                    <Slider 
                      id="default-volume"
                      value={[localSettings.volume]} 
                      min={0} 
                      max={100} 
                      step={1}
                      onValueChange={(value) => handleSettingChange("volume", value[0])}
                    />
                    <p className="text-right text-sm mt-1">{Math.round(localSettings.volume)}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="default-muted">Start Muted</Label>
                    <p className="text-sm text-gray-400">Start the player with sound muted</p>
                  </div>
                  <Switch 
                    id="default-muted"
                    checked={localSettings.isMuted} 
                    onCheckedChange={(checked) => handleSettingChange("isMuted", checked)} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="default-repeat">Default Repeat</Label>
                    <p className="text-sm text-gray-400">Automatically repeat tracks</p>
                  </div>
                  <Switch 
                    id="default-repeat"
                    checked={localSettings.isRepeating} 
                    onCheckedChange={(checked) => handleSettingChange("isRepeating", checked)} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="default-shuffle">Default Shuffle</Label>
                    <p className="text-sm text-gray-400">Start with shuffle mode enabled</p>
                  </div>
                  <Switch 
                    id="default-shuffle"
                    checked={localSettings.isShuffling} 
                    onCheckedChange={(checked) => handleSettingChange("isShuffling", checked)} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualizer">
            <Card>
              <CardHeader>
                <CardTitle>Visualizer Settings</CardTitle>
                <CardDescription>Configure the audio visualizer appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-visualizer">Show Visualizer</Label>
                    <p className="text-sm text-gray-400">Show visualizer by default</p>
                  </div>
                  <Switch 
                    id="show-visualizer"
                    checked={localSettings.showVisualizer} 
                    onCheckedChange={(checked) => handleSettingChange("showVisualizer", checked)} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="visualizer-type">Default Visualizer Type</Label>
                    <p className="text-sm text-gray-400">Choose your preferred visualization style</p>
                  </div>
                  <Select 
                    value={localSettings.visualizerType}
                    onValueChange={(value) => handleSettingChange("visualizerType", value as "bars" | "wave" | "circles")}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bars">Bars</SelectItem>
                      <SelectItem value="wave">Wave</SelectItem>
                      <SelectItem value="circles">Circles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="color-scheme">Color Scheme</Label>
                    <p className="text-sm text-gray-400">Choose your preferred color scheme</p>
                  </div>
                  <Select 
                    value={localSettings.colorScheme}
                    onValueChange={(value) => handleSettingChange("colorScheme", value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select colors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="rainbow">Rainbow</SelectItem>
                      <SelectItem value="neon">Neon</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equalizer">
            <Card>
              <CardHeader>
                <CardTitle>Equalizer Settings</CardTitle>
                <CardDescription>Configure the audio equalizer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-equalizer">Show Equalizer</Label>
                    <p className="text-sm text-gray-400">Show equalizer by default</p>
                  </div>
                  <Switch 
                    id="show-equalizer"
                    checked={localSettings.showEqualizer} 
                    onCheckedChange={(checked) => handleSettingChange("showEqualizer", checked)} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="equalizer-preset">Default Preset</Label>
                    <p className="text-sm text-gray-400">Choose your preferred equalizer preset</p>
                  </div>
                  <Select 
                    value={localSettings.equalizerPreset}
                    onValueChange={(value) => handleSettingChange("equalizerPreset", value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select preset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="bass">Bass Boost</SelectItem>
                      <SelectItem value="vocal">Vocal Boost</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="electronic">Electronic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interface">
            <Card>
              <CardHeader>
                <CardTitle>Interface Settings</CardTitle>
                <CardDescription>Configure the user interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-gray-400">Use dark theme by default</p>
                  </div>
                  <Switch 
                    id="dark-mode"
                    checked={localSettings.isDarkMode} 
                    onCheckedChange={(checked) => handleSettingChange("isDarkMode", checked)} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="minimize-player">Minimized Player</Label>
                    <p className="text-sm text-gray-400">Start with minimized player</p>
                  </div>
                  <Switch 
                    id="minimize-player"
                    checked={localSettings.isMinimized} 
                    onCheckedChange={(checked) => handleSettingChange("isMinimized", checked)} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="default-panel">Default Panel</Label>
                    <p className="text-sm text-gray-400">Default panel to show in player</p>
                  </div>
                  <Select 
                    value={localSettings.activePanel}
                    onValueChange={(value) => handleSettingChange("activePanel", value as "lyrics" | "info" | "visualizer")}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select panel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lyrics">Lyrics</SelectItem>
                      <SelectItem value="info">Track Info</SelectItem>
                      <SelectItem value="visualizer">Visualizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
} 