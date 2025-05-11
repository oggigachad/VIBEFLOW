"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { artists, songs } from "@/lib/data"
import { useMusic } from "@/context/music-context"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { UserPlus, UserMinus, Music } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ArtistsPage() {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { followArtist, unfollowArtist, isFollowing } = useMusic()
  const router = useRouter()
  
  // Check authentication status
  useEffect(() => {
    const user = localStorage.getItem("user")
    setIsAuthenticated(!!user)
  }, [])
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  // Handle follow/unfollow
  const handleFollowToggle = (artistId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to follow artists.",
        variant: "destructive",
      })
      // Redirect to login page
      router.push("/auth/login")
      return
    }

    // Check if the artist is followed, with null check
    const following = isFollowing ? isFollowing(artistId) : false
    
    if (following) {
      if (unfollowArtist) {
        unfollowArtist(artistId)
        toast({
          title: "Artist Unfollowed",
          description: `You are no longer following this artist.`,
        })
      }
    } else {
      if (followArtist) {
        const success = followArtist(artistId)
        if (success) {
          toast({
            title: "Artist Followed",
            description: `Artist added to your library. You can now find their songs in your playlists.`,
          })
        }
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <motion.h1
        className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Featured Artists
      </motion.h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {artists.map((artist) => {
          // Get songs by this artist
          const artistSongs = songs.filter(song => 
            song.artist.toLowerCase().includes(artist.name.toLowerCase())
          )
          
          // Check if the artist is followed, with null check
          const following = isFollowing ? isFollowing(artist.id) : false
          
          return (
            <motion.div
              key={artist.id}
              className="bg-black/30 backdrop-blur-md rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ 
                y: -5,
                boxShadow: "0 20px 25px -5px rgba(138, 43, 226, 0.1), 0 10px 10px -5px rgba(138, 43, 226, 0.04)"
              }}
            >
              <div className="relative h-64 w-full overflow-hidden group">
                <Image 
                  src={artist.coverUrl} 
                  alt={artist.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 w-full flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{artist.name}</h2>
                    <p className="text-purple-300 text-sm">{artistSongs.length} songs</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollowToggle(artist.id);
                    }}
                    className={`p-2 rounded-full ${
                      following 
                        ? "bg-purple-600 hover:bg-purple-700" 
                        : "bg-gray-800 hover:bg-gray-700"
                    } transition-colors`}
                    title={following ? "Unfollow Artist" : "Follow Artist"}
                  >
                    {following ? (
                      <UserMinus className="h-5 w-5 text-white" />
                    ) : (
                      <UserPlus className="h-5 w-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-gray-300 mb-4 h-20 overflow-hidden text-ellipsis">{artist.bio}</p>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-purple-400">Popular Tracks</h3>
                  <ul className="space-y-2">
                    {artistSongs.slice(0, 3).map(song => (
                      <li key={song.id} className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded overflow-hidden">
                          <Image 
                            src={song.coverUrl} 
                            alt={song.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Link 
                          href={`/discover?song=${song.id}`}
                          className="text-gray-200 hover:text-purple-400 transition-colors"
                        >
                          {song.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-md text-white font-medium hover:from-purple-700 hover:to-blue-600 transition-colors"
                    onClick={() => setSelectedArtist(selectedArtist === artist.id ? null : artist.id)}
                  >
                    View All Songs
                  </button>
                  
                  {following && (
                    <Link
                      href={`/library?artist=${artist.id}`}
                      className="py-2 px-3 bg-purple-900/50 rounded-md text-white hover:bg-purple-900/70 transition-colors"
                      title="View in Library"
                    >
                      <Music className="h-5 w-5" />
                    </Link>
                  )}
                </div>
                
                {selectedArtist === artist.id && (
                  <motion.div 
                    className="mt-4 space-y-2 bg-black/50 p-3 rounded-md"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {artistSongs.map(song => (
                      <Link 
                        key={song.id}
                        href={`/discover?song=${song.id}`}
                        className="block p-2 hover:bg-purple-900/30 rounded transition-colors"
                      >
                        {song.title}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
      <Toaster />
    </div>
  )
} 