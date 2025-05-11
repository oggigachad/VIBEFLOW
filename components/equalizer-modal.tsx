"use client"

import { useState, useEffect, useRef } from "react"
import { X, Zap, Wand2, Music, Radio, Waves, Disc, Sparkles, Volume2 } from "lucide-react"
import { motion } from "framer-motion"

type EqualizerModalProps = {
  onClose: () => void
}

// Frequency bands for equalizer
const frequencyBands = [
  { id: "band1", label: "32Hz", defaultValue: 0, color: "#8b5cf6" },
  { id: "band2", label: "64Hz", defaultValue: 0, color: "#7c3aed" },
  { id: "band3", label: "125Hz", defaultValue: 0, color: "#6d28d9" },
  { id: "band4", label: "250Hz", defaultValue: 0, color: "#5b21b6" },
  { id: "band5", label: "500Hz", defaultValue: 0, color: "#4c1d95" },
  { id: "band6", label: "1kHz", defaultValue: 0, color: "#6366f1" },
  { id: "band7", label: "2kHz", defaultValue: 0, color: "#4f46e5" },
  { id: "band8", label: "4kHz", defaultValue: 0, color: "#4338ca" },
  { id: "band9", label: "8kHz", defaultValue: 0, color: "#3730a3" },
  { id: "band10", label: "16kHz", defaultValue: 0, color: "#312e81" },
]

// Preset configurations
const presets = [
  { id: "flat", name: "Flat", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: "bass", name: "Bass Boost", values: [7, 6, 5, 3, 1, 0, 0, 0, 0, 0] },
  { id: "treble", name: "Treble Boost", values: [0, 0, 0, 0, 0, 2, 3, 5, 6, 7] },
  { id: "vocal", name: "Vocal Boost", values: [0, 0, 0, 2, 4, 5, 4, 2, 0, 0] },
  { id: "electronic", name: "Electronic", values: [4, 3, 0, -2, -1, 0, 1, 3, 4, 5] },
  { id: "rock", name: "Rock", values: [3, 2, 1, 0, -1, -1, 0, 2, 3, 4] },
  { id: "hip-hop", name: "Hip-Hop", values: [5, 4, 3, 2, 0, -1, 0, 1, 2, 3] },
  { id: "jazz", name: "Jazz", values: [2, 1, 0, -1, -2, 0, 1, 2, 3, 3] },
]

// FX Sound Effects
const fxEffects = [
  { id: "reverb", name: "Reverb", icon: <Waves className="w-4 h-4" />, active: false },
  { id: "delay", name: "Delay", icon: <Radio className="w-4 h-4" />, active: false },
  { id: "chorus", name: "Chorus", icon: <Music className="w-4 h-4" />, active: false },
  { id: "flanger", name: "Flanger", icon: <Disc className="w-4 h-4" />, active: false },
  { id: "distortion", name: "Distortion", icon: <Zap className="w-4 h-4" />, active: false },
  { id: "compressor", name: "Compressor", icon: <Volume2 className="w-4 h-4" />, active: false },
  { id: "phaser", name: "Phaser", icon: <Wand2 className="w-4 h-4" />, active: false },
  { id: "sparkle", name: "Sparkle", icon: <Sparkles className="w-4 h-4" />, active: false },
]

export default function EqualizerModal({ onClose }: EqualizerModalProps) {
  const [bands, setBands] = useState(frequencyBands.map((band) => band.defaultValue))
  const [activePreset, setActivePreset] = useState("flat")
  const [activeTab, setActiveTab] = useState("equalizer")
  const [effects, setEffects] = useState(fxEffects)
  const [masterGain, setMasterGain] = useState(0)
  const [visualizerActive, setVisualizerActive] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  const handleBandChange = (index: number, value: number) => {
    const newBands = [...bands]
    newBands[index] = value
    setBands(newBands)
    setActivePreset("custom")
  }

  const applyPreset = (presetId: string, values: number[]) => {
    setBands(values)
    setActivePreset(presetId)
  }

  const toggleEffect = (effectId: string) => {
    setEffects(effects.map(effect => 
      effect.id === effectId 
        ? { ...effect, active: !effect.active } 
        : effect
    ))
  }

  // Enhanced visualizer animation effect with performance optimizations
  useEffect(() => {
    if (!visualizerActive || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas dimensions with lower DPI for performance
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) // Cap at 1.5x for better performance
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
    ctx.scale(dpr, dpr)
    
    // Reduce number of particles for better performance
    let particles: { x: number; y: number; size: number; speed: number; color: string; opacity: number }[] = []
    
    // Initialize particles for active effects (reduce count)
    const activeEffectsCount = effects.filter(e => e.active).length
    if (activeEffectsCount > 0) {
      // Limit particles to 20 maximum for performance
      const particleCount = Math.min(activeEffectsCount * 3, 20)
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.clientWidth,
          y: Math.random() * canvas.clientHeight,
          size: Math.random() * 2 + 1,
          speed: Math.random() * 0.5 + 0.1,
          color: `hsl(${Math.random() * 60 + 240}, 70%, 60%)`,
          opacity: Math.random() * 0.5 + 0.5
        })
      }
    }
    
    // Use a lower time increment for smoother animation
    let time = 0
    let frameCount = 0
    const frameSkip = 2 // Only render every 3rd frame
    
    const animate = () => {
      frameCount++
      // Skip frames for performance
      if (frameCount % frameSkip !== 0) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      
      time += 0.008 // Lower increment for smoother animation
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      
      // Clear canvas with sophisticated fade effect (use higher alpha for less fade processing)
      ctx.fillStyle = 'rgba(17, 24, 39, 0.3)'
      ctx.fillRect(0, 0, width, height)
      
      // Draw frequency spectrum analyzer
      const barWidth = width / bands.length
      const barSpacing = 2
      const maxBarHeight = height * 0.85
      
      // Add a subtle grid - but with fewer lines for performance
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < height; i += 20) { // Fewer grid lines (every 20px instead of 10px)
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(width, i)
        ctx.stroke()
      }
      
      // Draw visualizer bars based on equalizer bands with simplified animation
      bands.forEach((value, index) => {
        // Simpler animation calculation
        const animatedValue = value + Math.sin(time * 2 + index * 0.2) * (Math.abs(value) * 0.05 + 0.3)
        
        // Calculate bar height with improved mapping
        const normalizedValue = (animatedValue + 12) / 24 // Convert from -12..12 to 0..1
        const barHeight = normalizedValue * maxBarHeight
        
        // Calculate x position
        const x = index * barWidth
        
        // Use simple colors instead of gradients for performance
        const color = frequencyBands[index].color
        ctx.fillStyle = color
        
        // Draw bar with simplified style
        ctx.beginPath()
        ctx.moveTo(x + barSpacing, height)
        ctx.lineTo(x + barSpacing, height - barHeight + 5)
        ctx.arc(x + barWidth/2, height - barHeight + 5, barWidth/2 - barSpacing, Math.PI, 0, false)
        ctx.lineTo(x + barWidth - barSpacing, height)
        ctx.closePath()
        ctx.fill()
        
        // Add simplified glow effect - only for higher values
        if (normalizedValue > 0.5) {
          const glowIntensity = 10 * normalizedValue
          ctx.shadowColor = color
          ctx.shadowBlur = glowIntensity
          ctx.fillRect(x + barSpacing, height - barHeight, barWidth - barSpacing * 2, barHeight / 4)
          ctx.shadowBlur = 0
        }
      })
      
      // Render and animate particles for active effects - but only if not too many bands are active
      if (particles.length > 0 && activeEffectsCount < 5) {
        particles.forEach((particle, i) => {
          // Skip some particles on each frame for performance
          if (i % 2 === frameCount % 2) {
            ctx.fillStyle = particle.color.replace(')', `, ${particle.opacity})`)
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fill()
            
            // Move particles with simpler motion
            particle.y -= particle.speed
            
            // Reset particles that reach the top
            if (particle.y < -10) {
              particle.y = height + 10
              particle.x = Math.random() * width
            }
          }
        })
      }
      
      // Add analyzer center line with simpler animation for high gain only
      if (Math.abs(masterGain) > 6) {
        ctx.strokeStyle = masterGain > 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        
        // Simplified line with fewer points
        for (let x = 0; x < width; x += 3) { // Draw fewer points (every 3px)
          const y = height / 2 + Math.sin(x * 0.03 + time * 3) * 3 * Math.abs(masterGain) / 12
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [bands, visualizerActive, effects, masterGain])

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-purple-800/40"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent flex items-center">
            <motion.div
              animate={{ rotate: [0, 15, 0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
            </motion.div>
            Pro Audio Studio
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setVisualizerActive(!visualizerActive)}
              className={`text-sm px-3 py-1 rounded-full transition-all ${
                visualizerActive 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-700/20' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Visualizer {visualizerActive ? 'On' : 'Off'}
            </button>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition-colors hover:bg-gray-800/50 p-1.5 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab("equalizer")}
            className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "equalizer"
                ? "text-purple-400 border-b-2 border-purple-500 bg-gray-800/30"
                : "text-gray-400 hover:text-white hover:bg-gray-800/20"
            }`}
          >
            <Waves className="w-4 h-4" />
            Equalizer
          </button>
          <button
            onClick={() => setActiveTab("effects")}
            className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "effects"
                ? "text-purple-400 border-b-2 border-purple-500 bg-gray-800/30"
                : "text-gray-400 hover:text-white hover:bg-gray-800/20"
            }`}
          >
            <Zap className="w-4 h-4" />
            FX Effects
          </button>
        </div>

        {/* Visualizer */}
        {visualizerActive && (
          <div className="p-4 border-b border-gray-800 bg-gray-900/50">
            <div className="relative">
              <canvas 
                ref={canvasRef} 
                className="w-full h-32 rounded-lg"
                style={{ 
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.15) inset",
                  background: "linear-gradient(180deg, rgba(17, 24, 39, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%)"
                }}
              />
              <div className="absolute top-2 left-2 text-xs text-gray-500 opacity-50 flex items-center">
                <div className="w-1 h-1 bg-green-500 rounded-full mr-1 animate-pulse"></div> LIVE
              </div>
            </div>
          </div>
        )}

        {activeTab === "equalizer" && (
          <div className="p-6">
            {/* Presets */}
            <div className="mb-8">
              <h3 className="text-sm text-gray-400 mb-3">Presets</h3>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id, preset.values)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activePreset === preset.id
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency Bands */}
            <div className="grid grid-cols-10 gap-2 h-64">
              {frequencyBands.map((band, index) => (
                <div key={band.id} className="flex flex-col items-center">
                  <div className="flex-1 w-full flex items-center justify-center">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={bands[index]}
                      onChange={(e) => handleBandChange(index, Number.parseInt(e.target.value))}
                      className="h-full appearance-none bg-transparent cursor-pointer"
                      style={{
                        writingMode: "vertical-rl" as any, /* Fix for IE compatibility */
                        WebkitAppearance: "slider-vertical" /* WebKit */,
                        width: "24px",
                        height: "100%",
                      }}
                    />
                  </div>
                  <div
                    className="h-2 w-full rounded-full mt-2"
                    style={{
                      background: band.color,
                      opacity: 0.3 + (Math.abs(bands[index]) / 12) * 0.7,
                      transform: `scaleX(${0.5 + (Math.abs(bands[index]) / 12) * 0.5})`,
                      boxShadow: `0 0 10px ${band.color}`,
                    }}
                  ></div>
                  <span className="text-xs text-gray-400 mt-2">{band.label}</span>
                  <span className="text-xs font-mono text-gray-500">
                    {bands[index] > 0 ? `+${bands[index]}` : bands[index]}
                  </span>
                </div>
              ))}
            </div>

            {/* Master Gain */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-700">
              <div className="w-full">
                <label className="text-sm text-gray-400 block mb-1">Master Gain</label>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={masterGain}
                  onChange={(e) => setMasterGain(Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${masterGain < 0 ? '#ef4444' : '#10b981'}, #6366f1)`,
                  }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">-12 dB</span>
                  <span className="text-xs text-gray-500">
                    {masterGain > 0 ? `+${masterGain}` : masterGain} dB
                  </span>
                  <span className="text-xs text-gray-500">+12 dB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "effects" && (
          <div className="p-6">
            <h3 className="text-sm text-gray-400 mb-4">Sound Effects</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {effects.map((effect) => (
                <button
                  key={effect.id}
                  onClick={() => toggleEffect(effect.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
                    effect.active 
                      ? "bg-gradient-to-br from-purple-800 to-blue-900 border border-purple-500 shadow-lg shadow-purple-900/30" 
                      : "bg-gray-800 border border-gray-700 hover:bg-gray-700"
                  }`}
                >
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      effect.active 
                        ? "bg-purple-500 text-white" 
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {effect.icon}
                  </div>
                  <span className={`text-sm ${effect.active ? "text-white" : "text-gray-400"}`}>
                    {effect.name}
                  </span>
                  <span className={`text-xs mt-1 ${effect.active ? "text-purple-300" : "text-gray-500"}`}>
                    {effect.active ? "Active" : "Off"}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Effect Intensity Controls */}
            <div className="mt-8 pt-4 border-t border-gray-700">
              <h3 className="text-sm text-gray-400 mb-4">Effect Intensity</h3>
              {effects.filter(e => e.active).map(effect => (
                <div key={`${effect.id}-control`} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <label className="text-sm text-white">{effect.name}</label>
                    <span className="text-xs text-gray-400">50%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${effect.active ? effect.id === 'distortion' ? '#ef4444' : '#8b5cf6' : '#374151'}, #374151)`,
                    }}
                  />
                </div>
              ))}
              
              {effects.filter(e => e.active).length === 0 && (
                <p className="text-gray-500 text-center py-4">No active effects. Enable effects above to adjust intensity.</p>
              )}
            </div>
          </div>
        )}

        {/* Apply Button */}
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md transition-colors shadow-lg shadow-purple-900/30">
            Apply Settings
          </button>
        </div>
      </motion.div>
    </div>
  )
}
