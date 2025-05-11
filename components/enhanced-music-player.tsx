"use client"

import { useEffect } from "react"
import MusicPlayer from "./music-player"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMusic } from "@/hooks/use-music"
import LyricsDisplay from "./lyrics-display"
import QueueManager from "./queue-manager"
import EqualizerPanel from "./equalizer-panel"
import { Button } from "@/components/ui/button"
import { Minimize2 } from "lucide-react"

interface EnhancedMusicPlayerProps {
  onClose: () => void;
}

export default function EnhancedMusicPlayer({ onClose }: EnhancedMusicPlayerProps) {
  const { currentTrack } = useMusic()
  
  // Add escape key handler to close the expanded player
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [onClose]);
  
  if (!currentTrack) {
    return null
  }
  
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header with close button */}
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Now Playing</h2>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 h-full">
          {/* Album art and track info */}
          <div className="md:col-span-4 border-r border-border p-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-xs h-auto rounded-lg overflow-hidden mb-6 shadow-xl aspect-square">
              <img 
                src={currentTrack.coverArt} 
                alt={currentTrack.title}
                className="object-cover w-full h-full transition-transform hover:scale-105 duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-1">{currentTrack.title}</h2>
            <p className="text-muted-foreground text-center mb-4">{currentTrack.artist}</p>
            <p className="text-sm text-muted-foreground text-center">{currentTrack.album || "Unknown Album"}</p>
            
            {currentTrack.year && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                {currentTrack.year} • {currentTrack.genre || "Unknown Genre"}
              </p>
            )}
          </div>
          
          {/* Tabs section */}
          <div className="md:col-span-8 flex flex-col overflow-hidden">
            <Tabs defaultValue="lyrics" className="flex-1 overflow-hidden">
              <TabsList className="mx-6 mt-6 grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
                <TabsTrigger value="queue">Queue</TabsTrigger>
                <TabsTrigger value="equalizer">Equalizer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="lyrics" className="flex-1 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="p-6">
                    <LyricsDisplay trackId={currentTrack.id} />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="queue" className="flex-1 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="p-6">
                    <QueueManager />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="equalizer" className="flex-1 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="p-6">
                    <EqualizerPanel />
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Player controls */}
      <div className="border-t border-border">
        <MusicPlayer 
          variant="expanded" 
          onToggleExpand={onClose}
          className="container mx-auto"
        />
      </div>
    </div>
  )
} 