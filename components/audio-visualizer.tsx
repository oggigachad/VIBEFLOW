"use client"

import { useRef, useEffect } from "react"
import { useMusic } from "@/context/music-context"

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>
  className?: string
}

export default function AudioVisualizer({ audioRef, className = "" }: AudioVisualizerProps) {
  const { isPlaying } = useMusic()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  
  // Initialize Web Audio API and connect to audio element
  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return
    
    // Create audio context if needed
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioContext()
      } catch (error) {
        console.error("Web Audio API is not supported in this browser", error)
        return
      }
    }
    
    // Create analyzer if needed
    if (!analyserRef.current && audioContextRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256 // Adjust for better performance
      analyserRef.current.smoothingTimeConstant = 0.8 // Smoother transitions
    }
    
    // Create and connect source if needed
    if (!sourceRef.current && audioRef.current && audioContextRef.current && analyserRef.current) {
      try {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
        sourceRef.current.connect(analyserRef.current)
        analyserRef.current.connect(audioContextRef.current.destination)
      } catch (error) {
        console.error("Error connecting audio source", error)
        return
      }
    }
    
    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioRef])
  
  // Handle animation based on isPlaying state
  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current) return
    
    if (isPlaying) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      // Set canvas dimensions once to avoid performance issues
      canvas.width = canvas.clientWidth * window.devicePixelRatio
      canvas.height = canvas.clientHeight * window.devicePixelRatio
      
      const draw = () => {
        // Make sure we're still playing and have a valid context
        if (!isPlaying || !analyserRef.current) {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
          }
          return
        }
        
        analyserRef.current.getByteFrequencyData(dataArray)
        
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        const barWidth = Math.max((canvas.width / bufferLength) * 2.5, 2)
        const barGap = 1
        let x = 0
        
        for (let i = 0; i < bufferLength; i++) {
          // Apply a logarithmic scale for more natural-looking visualization
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.8
          
          // Create gradient
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
          gradient.addColorStop(0, 'rgba(167, 139, 250, 0.9)')
          gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.6)')
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)')
          
          ctx.fillStyle = gradient
          
          // Draw rounded bars
          ctx.beginPath()
          ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, 2)
          ctx.fill()
          
          x += barWidth + barGap
        }
        
        animationRef.current = requestAnimationFrame(draw)
      }
      
      // Start the animation
      draw()
    } else if (animationRef.current) {
      // Cancel animation when paused
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
      
      // Clear the canvas when stopped
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      }
    }
    
    // Cleanup on effect change
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [isPlaying])
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      if (sourceRef.current && audioContextRef.current) {
        try {
          sourceRef.current.disconnect()
        } catch (e) {
          console.log("Source already disconnected")
        }
      }
      
      if (analyserRef.current && audioContextRef.current) {
        try {
          analyserRef.current.disconnect()
        } catch (e) {
          console.log("Analyser already disconnected")
        }
      }
    }
  }, [])
  
  return <canvas ref={canvasRef} className={className} />
}
