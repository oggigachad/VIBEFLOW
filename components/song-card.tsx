"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, MoreHorizontal, Heart } from "lucide-react"
import Image from "next/image"
import { useMusic } from "@/context/music-context"
import type { Song } from "@/lib/types"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"

export default function SongCard({ song }: { song: Song }) {
  const { currentTrack, isPlaying, playTrack, togglePlayPause, isLiked, toggleLikeSong, queue } = useMusic()
  const { user } = useAuth()
  const { toast } = useToast()
  const isCurrentSong = currentTrack?.id === song.id
  const cardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Import gsap dynamically to avoid SSR issues
    import('gsap').then((gsap) => {
      gsap.default.fromTo(
        cardRef.current,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3,
          ease: "power2.out",
          delay: Math.random() * 0.2 // Staggered effect
        }
      );
    }).catch(error => console.error("Failed to load GSAP:", error));
  }, []);

  const handlePlayClick = () => {
    // If it's already the current song, just toggle playback
    if (isCurrentSong) {
      togglePlayPause();
      return;
    }
    
    // Find the exact song index in queue by ID
    const exactMatchIndex = queue.findIndex(track => track.id === song.id);
    
    if (exactMatchIndex !== -1) {
      // Found the exact song by ID
      playTrack(exactMatchIndex);
      return;
    }
    
    // Try to find by title and artist (case insensitive)
    const normalizedTitle = song.title.toLowerCase().trim();
    const normalizedArtist = song.artist.toLowerCase().trim();
    
    // Look for a similar track
    const similarTrackIndex = queue.findIndex(track => 
      track.title.toLowerCase().trim() === normalizedTitle && 
      track.artist.toLowerCase().trim() === normalizedArtist
    );
    
    if (similarTrackIndex !== -1) {
      // Found by title and artist match
      playTrack(similarTrackIndex);
      return;
    }
    
    // Try to find any track by this artist
    const sameArtistIndex = queue.findIndex(track => 
      track.artist.toLowerCase().trim() === normalizedArtist
    );
    
    if (sameArtistIndex !== -1) {
      // Found another song by the same artist
      playTrack(sameArtistIndex);
      toast({
        title: "Similar track found",
        description: `Playing "${queue[sameArtistIndex].title}" by ${song.artist}`,
        duration: 3000,
      });
      return;
    }
    
    // If still not found, show error and don't change the current track
    toast({
      title: "Track not available",
      description: `"${song.title}" by ${song.artist} isn't currently in the queue`,
      duration: 3000,
    });
  }

  const handleLikeClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add songs to your favorites.",
        variant: "destructive",
      })
      router.push("/auth")
      return
    }
    
    // Convert Song to Track format for the toggleLikeSong function
    const trackData = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: "Unknown Album", // Set a default value since Song doesn't have album
      duration: song.duration,
      coverArt: song.coverUrl,
      audioUrl: song.audioUrl,
      genre: song.genre
    };
    
    const wasAdded = toggleLikeSong(trackData);
    
    if (wasAdded) {
      toast({
        title: "Added to Favorites",
        description: `${song.title} has been added to your favorites.`,
      })
    } else {
      toast({
        title: "Removed from Favorites",
        description: `${song.title} has been removed from your favorites.`,
      })
    }
  }

  return (
    <div ref={cardRef} className="opacity-0">
      <Card className="overflow-hidden group" data-song-id={song.id}>
        <div className="relative aspect-square">
          <Image
            src={song.coverUrl || "/placeholder.svg?height=300&width=300"}
            alt={song.title}
            fill
            priority={song.id === "track1" || song.id === "track11"}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-700"
              onClick={handlePlayClick}
            >
              {isCurrentSong && isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h3 className="font-medium truncate">{song.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLikeClick}>
                <Heart className={cn("h-4 w-4", isLiked(song.id) && "fill-red-500 text-red-500")} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
