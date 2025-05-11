"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Pause, Heart } from "lucide-react"
import type { Song } from "@/lib/types"

interface SongRowProps {
  song: Song
  index: number
  onPlay: () => void
  isLiked: boolean
  onLike: () => void
  isPlaying?: boolean
  isAuthenticated?: boolean
  onAuthRequired?: () => void
}

export default function SongRow({ 
  song, 
  index, 
  onPlay, 
  isLiked, 
  onLike, 
  isPlaying = false,
  isAuthenticated = true,
  onAuthRequired
}: SongRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }
  
  // Handle like with authentication check
  const handleLike = () => {
    if (!isAuthenticated && onAuthRequired) {
      onAuthRequired()
      return
    }
    onLike()
  }
  
  return (
    <div 
      className={`flex items-center p-2 rounded-md ${isHovered ? 'bg-purple-900/20' : 'hover:bg-purple-900/10'} transition-colors`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Number/Play Button */}
      <div className="w-10 flex items-center justify-center">
        {isHovered ? (
          <button 
            onClick={onPlay}
            className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-700 transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 text-white" />
            ) : (
              <Play className="h-4 w-4 text-white ml-0.5" />
            )}
          </button>
        ) : (
          <span className="text-gray-400 text-sm">{index}</span>
        )}
      </div>
      
      {/* Song Info */}
      <div className="flex items-center flex-1 min-w-0">
        <div className="h-10 w-10 relative rounded overflow-hidden mr-3">
          <Image 
            src={song.coverUrl} 
            alt={song.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-white font-medium text-sm truncate">{song.title}</h3>
          <p className="text-gray-400 text-xs truncate">{song.artist}</p>
        </div>
      </div>
      
      {/* Duration */}
      <div className="text-gray-400 text-sm mr-4">
        {formatDuration(song.duration)}
      </div>
      
      {/* Like Button */}
      <button 
        onClick={handleLike}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
      </button>
    </div>
  )
} 