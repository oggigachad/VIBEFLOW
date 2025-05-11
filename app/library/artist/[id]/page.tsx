"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { useMusic } from "@/context/music-context"
import { artists, songs } from "@/lib/data"
import { Play, Heart } from "lucide-react"
import SongRow from "@/components/song-row"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function ArtistPlaylistPage() {
  const params = useParams()
  const router = useRouter()
  const artistId = params.id as string
  const { playSong, isLiked, toggleLikeSong, isFollowing, unfollowArtist } = useMusic()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Find artist and their songs
  const artist = artists.find(a => a.id === artistId)
  const artistSongs = songs.filter(song => 
    artist && song.artist.toLowerCase().includes(artist.name.toLowerCase())
  )
  
  // Check authentication status
  useEffect(() => {
    const user = localStorage.getItem("user")
    setIsAuthenticated(!!user)
  }, [])
  
  // Handle unfollow
  const handleUnfollow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your followed artists.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }
    
    unfollowArtist(artistId)
    toast({
      title: "Artist Unfollowed",
      description: `You are no longer following ${artist?.name}.`,
    })
  }
  
  // Handle play all
  const handlePlayAll = () => {
    if (artistSongs.length > 0) {
      playSong(artistSongs[0])
    }
  }
  
  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <h1 className="text-2xl font-bold text-white">Artist not found</h1>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {/* Artist Header */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-xl mb-8">
        <Image 
          src={artist.coverUrl} 
          alt={artist.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{artist.name}</h1>
              <p className="text-gray-300 text-sm md:text-base">{artistSongs.length} songs in your library</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePlayAll}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-white font-medium hover:from-purple-700 hover:to-blue-600 transition-colors flex items-center gap-2"
              >
                <Play className="h-5 w-5" />
                Play All
              </button>
              <button
                onClick={handleUnfollow}
                className="px-6 py-2 bg-gray-800 rounded-full text-white font-medium hover:bg-gray-700 transition-colors"
              >
                Unfollow
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Songs List */}
      <div className="bg-black/30 backdrop-blur-md rounded-xl overflow-hidden border border-purple-500/20">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-white mb-4">Songs</h2>
          
          {artistSongs.length > 0 ? (
            <div className="space-y-1">
              {artistSongs.map((song, index) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={index + 1}
                  onPlay={() => playSong(song)}
                  isLiked={isLiked(song.id)}
                  onLike={() => toggleLikeSong(song)}
                  isAuthenticated={isAuthenticated}
                  onAuthRequired={() => {
                    toast({
                      title: "Authentication Required",
                      description: "Please sign in to like songs.",
                      variant: "destructive",
                    });
                    router.push("/auth/login");
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No songs available from this artist.</p>
          )}
        </div>
      </div>
      
      {/* Artist Bio */}
      <div className="mt-8 bg-black/30 backdrop-blur-md rounded-xl overflow-hidden border border-purple-500/20 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">About</h2>
        <p className="text-gray-300">{artist.bio}</p>
      </div>
      
      <Toaster />
    </div>
  )
} 