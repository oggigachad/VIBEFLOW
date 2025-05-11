"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useMusic } from "@/context/music-context"
import { Play, Pause, SkipForward, SkipBack, Maximize2, MinusSquare, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/sidebar-context"

interface MiniPlayerProps {
  onExpand: () => void
}

export default function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    progress,
    togglePlayPause,
    nextTrack,
    previousTrack
  } = useMusic()
  
  const { collapsed } = useSidebar()
  const [isHovered, setIsHovered] = useState(false)
  
  if (!currentTrack) return null
  
  return (
    <motion.div
      className={cn(
        "fixed bottom-4 z-50 rounded-full shadow-lg cursor-pointer transition-all duration-300",
        collapsed ? "right-1/2 translate-x-1/2" : "right-4"
      )}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        width: isHovered ? 280 : 60,
        height: 60,
        borderRadius: 30
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30
      }}
      onClick={(e) => {
        // If clicked on a button inside, don't expand
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        // Otherwise expand the player
        onExpand();
      }}
    >
      {/* Base player with album art */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md border border-border rounded-full overflow-hidden">
        <div className={cn(
          "absolute inset-0",
          isPlaying ? "animate-pulse-slow" : ""
        )}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full" />
        </div>
      </div>
      
      {/* Album Art (Always visible) */}
      <motion.div 
        className="absolute left-0 top-0 h-[60px] w-[60px] rounded-full overflow-hidden bg-black"
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{ 
          duration: 20, 
          ease: "linear", 
          repeat: Infinity,
          repeatType: "loop"
        }}
      >
        <Image 
          src={currentTrack.coverArt} 
          alt={currentTrack.title}
          width={60}
          height={60}
          className="object-cover"
        />
      </motion.div>
      
      {/* Expanded controls (visible on hover) */}
      <AnimatedControls 
        isVisible={isHovered}
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onNext={nextTrack}
        onPrevious={previousTrack}
        onExpand={onExpand}
        title={currentTrack.title}
        artist={currentTrack.artist}
        progress={progress}
      />
    </motion.div>
  )
}

interface AnimatedControlsProps {
  isVisible: boolean
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onExpand: () => void
  title: string
  artist: string
  progress: number
}

function AnimatedControls({
  isVisible,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onExpand,
  title,
  artist,
  progress
}: AnimatedControlsProps) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pl-16 pr-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Track info */}
      <div className="flex-1 truncate mx-2 text-center pointer-events-none">
        <div className="text-xs font-medium truncate">{title}</div>
        <div className="text-xs text-muted-foreground truncate">{artist}</div>
        
        {/* Progress bar */}
        <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-foreground"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onPrevious();
          }}
        >
          <SkipBack size={14} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-foreground"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onPlayPause();
          }}
        >
          {isPlaying ? (
            <Pause size={14} />
          ) : (
            <Play size={14} className="ml-0.5" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-foreground"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <SkipForward size={14} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-foreground"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onExpand();
          }}
        >
          <Maximize2 size={14} />
        </Button>
      </div>
    </motion.div>
  )
} 