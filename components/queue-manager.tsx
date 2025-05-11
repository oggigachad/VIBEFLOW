"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useMusic } from "@/context/music-context"
import { Grip, Play, X, Clock, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/utils"
import { motion, Reorder, useDragControls } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

export default function QueueManager() {
  const {
    queue,
    currentTrackIndex,
    playTrack,
    removeFromQueue,
    moveTrackUp,
    moveTrackDown,
    currentTrack
  } = useMusic()
  
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [reorderedQueue, setReorderedQueue] = useState(queue)
  const queueContainerRef = useRef<HTMLDivElement>(null)
  
  // Update local queue when the context queue changes
  useEffect(() => {
    setReorderedQueue(queue)
  }, [queue])
  
  // Handle queue reordering with proper indexing
  const handleReorder = (newOrder: typeof queue) => {
    setReorderedQueue(newOrder)
    
    // Find the new positions of tracks
    const updatedPositions = newOrder.map(track => {
      const originalIndex = queue.findIndex(t => t.id === track.id)
      return { id: track.id, originalIndex, newIndex: newOrder.findIndex(t => t.id === track.id) }
    })
    
    // Apply the position changes one by one
    updatedPositions.forEach(item => {
      const diff = item.originalIndex - item.newIndex
      if (diff > 0) {
        // Track moved up
        for (let i = 0; i < diff; i++) {
          moveTrackUp(item.originalIndex - i)
        }
      } else if (diff < 0) {
        // Track moved down
        for (let i = 0; i < Math.abs(diff); i++) {
          moveTrackDown(item.originalIndex + i)
        }
      }
    })
    
    // Notify the user
    toast({
      title: "Queue updated",
      description: "Your playback queue has been reordered",
      duration: 1500,
    })
  }
  
  // No tracks in queue
  if (queue.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="p-6 rounded-full bg-muted/30 mb-3">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Your queue is empty</h3>
        <p className="text-muted-foreground text-center mt-2 max-w-xs">
          Add songs to your queue from the music library or discover page
        </p>
      </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Queue</h3>
        <span className="text-sm text-muted-foreground">{queue.length} tracks</span>
      </div>
      
      <div className="flex-1 overflow-y-auto" ref={queueContainerRef}>
        <Reorder.Group 
          axis="y" 
          values={reorderedQueue} 
          onReorder={handleReorder}
          className="space-y-1"
        >
          {reorderedQueue.map((track, index) => (
            <QueueItem
              key={track.id}
              track={track}
              index={index}
              isPlaying={currentTrack?.id === track.id}
              onPlay={() => {
                const originalIndex = queue.findIndex(t => t.id === track.id)
                if (originalIndex !== -1) {
                  playTrack(originalIndex)
                }
              }}
              onRemove={() => removeFromQueue(index)}
              onMoveUp={() => moveTrackUp(index)}
              onMoveDown={() => moveTrackDown(index)}
              setIsDragging={setIsDragging}
              isFirst={index === 0}
              isLast={index === reorderedQueue.length - 1}
              dragConstraints={queueContainerRef.current ? { current: queueContainerRef.current } : false}
            />
          ))}
        </Reorder.Group>
      </div>
      
      <div className="mt-4 pt-4 border-t border-muted">
        <p className="text-xs text-center text-muted-foreground">
          Drag tracks to reorder your queue or use the arrow buttons
        </p>
      </div>
    </div>
  )
}

interface QueueItemProps {
  track: {
    id: string
    title: string
    artist: string
    duration: number
    coverArt: string
  }
  index: number
  isPlaying: boolean
  onPlay: () => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  setIsDragging: (isDragging: boolean) => void
  isFirst: boolean
  isLast: boolean
  dragConstraints: React.RefObject<HTMLDivElement> | false
}

function QueueItem({
  track,
  index,
  isPlaying,
  onPlay,
  onRemove,
  onMoveUp,
  onMoveDown,
  setIsDragging,
  isFirst,
  isLast,
  dragConstraints
}: QueueItemProps) {
  const dragControls = useDragControls()
  const [hovered, setHovered] = useState(false)
  
  return (
    <Reorder.Item
      value={track}
      dragControls={dragControls}
      dragListener={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className={cn(
        "relative flex items-center p-2 rounded-md group",
        isPlaying ? "bg-primary/10" : "hover:bg-accent/50",
        "transition-colors duration-200"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      dragElastic={0.1}
      dragConstraints={dragConstraints}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
    >
      {/* Drag handle */}
      <div 
        className="cursor-move mr-2 text-muted-foreground hover:text-foreground"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <Grip size={16} />
      </div>
      
      {/* Track number */}
      <div className="w-6 text-center mr-2">
        {hovered ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={onPlay}
          >
            <Play size={14} className="ml-0.5" />
          </Button>
        ) : (
          <span className={cn(
            "text-sm",
            isPlaying ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            {index + 1}
          </span>
        )}
      </div>
      
      {/* Album art */}
      <div className="relative h-10 w-10 rounded overflow-hidden bg-muted/30 mr-3">
        <Image
          src={track.coverArt}
          alt={track.title}
          className="object-cover"
          fill
        />
      </div>
      
      {/* Track info */}
      <div className="flex-1 min-w-0 mr-2">
        <p className={cn(
          "text-sm truncate",
          isPlaying ? "text-primary font-medium" : ""
        )}>
          {track.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {track.artist}
        </p>
      </div>
      
      {/* Duration */}
      <div className="text-xs text-muted-foreground mr-2">
        {formatTime(track.duration)}
      </div>
      
      {/* Move up/down buttons - only visible on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col mr-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-5 w-5 text-muted-foreground hover:text-foreground",
            isFirst && "opacity-30 pointer-events-none"
          )}
          onClick={onMoveUp}
          disabled={isFirst}
        >
          <ArrowUp size={12} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-5 w-5 text-muted-foreground hover:text-foreground",
            isLast && "opacity-30 pointer-events-none"
          )}
          onClick={onMoveDown}
          disabled={isLast}
        >
          <ArrowDown size={12} />
        </Button>
      </div>
      
      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
        <X size={14} />
      </Button>
    </Reorder.Item>
  )
} 