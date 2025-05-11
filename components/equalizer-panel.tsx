"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { usePreferences } from "@/hooks/use-preferences"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const FREQUENCY_BANDS = [
  { freq: 32, label: "32Hz" },
  { freq: 64, label: "64Hz" },
  { freq: 125, label: "125Hz" },
  { freq: 250, label: "250Hz" },
  { freq: 500, label: "500Hz" },
  { freq: 1000, label: "1kHz" },
  { freq: 2000, label: "2kHz" },
  { freq: 4000, label: "4kHz" },
  { freq: 8000, label: "8kHz" },
  { freq: 16000, label: "16kHz" }
]

const PRESETS = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  bass: [7, 6, 5, 2, 0, 0, 0, 0, 0, 0],
  treble: [0, 0, 0, 0, 0, 1, 3, 5, 7, 8],
  electronic: [4, 3, 0, -2, -3, 0, 3, 4, 5, 6],
  rock: [4, 3, 2, 1, -1, -1, 0, 2, 3, 4],
  vocal: [-2, -3, -2, 1, 4, 4, 3, 1, -1, -2]
}

export default function EqualizerPanel() {
  const { preferences, updatePreferences } = usePreferences()
  const [equalizer, setEqualizer] = useState<number[]>(preferences.equalizer || PRESETS.flat)
  const [isEqualizerEnabled, setIsEqualizerEnabled] = useState(preferences.isEqualizerEnabled || false)
  const [preset, setPreset] = useState<string>("custom")
  
  // Apply preset
  const applyPreset = (presetName: string) => {
    if (presetName !== "custom") {
      setEqualizer(PRESETS[presetName as keyof typeof PRESETS])
      setPreset(presetName)
    }
  }
  
  // Check if current equalizer matches a preset
  useEffect(() => {
    let matchedPreset = "custom"
    
    // Check against each preset
    Object.entries(PRESETS).forEach(([name, values]) => {
      if (values.every((value, index) => value === equalizer[index])) {
        matchedPreset = name
      }
    })
    
    setPreset(matchedPreset)
  }, [equalizer])
  
  // Update preferences when equalizer changes
  useEffect(() => {
    // Only update if values actually changed
    const hasEqualizerChanged = !preferences.equalizer || 
      equalizer.some((value, index) => value !== preferences.equalizer[index]);
    
    const hasEnabledStateChanged = isEqualizerEnabled !== preferences.isEqualizerEnabled;
    
    if (hasEqualizerChanged || hasEnabledStateChanged) {
      updatePreferences({
        equalizer,
        isEqualizerEnabled
      });
    }
  }, [equalizer, isEqualizerEnabled, updatePreferences, preferences.equalizer, preferences.isEqualizerEnabled]);
  
  // Handle individual band change
  const handleBandChange = (value: number[], index: number) => {
    if (value[0] !== equalizer[index]) {
      const newEqualizer = [...equalizer]
      newEqualizer[index] = value[0]
      setEqualizer(newEqualizer)
    }
  }
  
  // Handle equalizer toggle
  const handleEqualizerToggle = (checked: boolean) => {
    setIsEqualizerEnabled(checked)
  }
  
  // Reset to flat
  const resetEqualizer = () => {
    setEqualizer(PRESETS.flat)
    setPreset("flat")
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Equalizer</h3>
          <p className="text-sm text-muted-foreground">Customize your sound</p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="equalizer-toggle" 
            checked={isEqualizerEnabled}
            onCheckedChange={handleEqualizerToggle}
          />
          <Label htmlFor="equalizer-toggle">
            {isEqualizerEnabled ? "Enabled" : "Disabled"}
          </Label>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <Select 
          value={preset} 
          onValueChange={applyPreset} 
          disabled={!isEqualizerEnabled}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select preset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flat">Flat</SelectItem>
            <SelectItem value="bass">Bass Boost</SelectItem>
            <SelectItem value="treble">Treble Boost</SelectItem>
            <SelectItem value="electronic">Electronic</SelectItem>
            <SelectItem value="rock">Rock</SelectItem>
            <SelectItem value="vocal">Vocal</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetEqualizer}
          disabled={!isEqualizerEnabled}
        >
          Reset
        </Button>
      </div>
      
      <div className={`grid grid-cols-10 gap-3 transition-opacity ${!isEqualizerEnabled ? "opacity-50" : ""}`}>
        {FREQUENCY_BANDS.map((band, index) => (
          <div key={band.freq} className="flex flex-col items-center">
            <div className="h-36 flex items-center">
              <Slider
                value={[equalizer[index]]}
                max={12}
                min={-12}
                step={1}
                orientation="vertical"
                onValueChange={(value) => handleBandChange(value, index)}
                disabled={!isEqualizerEnabled}
                className="h-full"
              />
            </div>
            <div className="text-center mt-2">
              <div className="text-sm">{equalizer[index] > 0 ? "+" : ""}{equalizer[index]}dB</div>
              <div className="text-xs text-muted-foreground">{band.label}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Additional Settings</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reverb">Reverb</Label>
            <Slider
              id="reverb"
              value={[preferences.reverbLevel || 0]}
              max={100}
              onValueChange={(value) => {
                if (value[0] !== preferences.reverbLevel) {
                  updatePreferences({ reverbLevel: value[0] })
                }
              }}
              disabled={!isEqualizerEnabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bass-boost">Bass Boost</Label>
            <Slider
              id="bass-boost"
              value={[preferences.bassBoost || 0]}
              max={100}
              onValueChange={(value) => {
                if (value[0] !== preferences.bassBoost) {
                  updatePreferences({ bassBoost: value[0] })
                }
              }}
              disabled={!isEqualizerEnabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clarity">Clarity</Label>
            <Slider
              id="clarity"
              value={[preferences.clarity || 0]}
              max={100}
              onValueChange={(value) => {
                if (value[0] !== preferences.clarity) {
                  updatePreferences({ clarity: value[0] })
                }
              }}
              disabled={!isEqualizerEnabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="spatial">Spatial Effect</Label>
            <Slider
              id="spatial"
              value={[preferences.spatialEffect || 0]}
              max={100}
              onValueChange={(value) => {
                if (value[0] !== preferences.spatialEffect) {
                  updatePreferences({ spatialEffect: value[0] })
                }
              }}
              disabled={!isEqualizerEnabled}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 