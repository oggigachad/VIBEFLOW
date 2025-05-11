"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { songs, artists } from "@/lib/data"
import SongCard from "@/components/song-card"
import { motion } from "framer-motion"
import { Play, Disc, Sparkles, TrendingUp, Music, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useMusic } from "@/context/music-context"
import { useAuth } from "@/context/auth-context"

export default function HomePage() {
  const { playTrack, togglePlayPause } = useMusic()
  const { user } = useAuth()
  const [featuredSongs, setFeaturedSongs] = useState<typeof songs>([])
  const [trendingSongs, setTrendingSongs] = useState<typeof songs>([])
  const [newReleases, setNewReleases] = useState<typeof songs>([])

  // Set featured songs on mount
  useEffect(() => {
    // Get 3 random songs for the featured section
    const randomSongs = [...songs].sort(() => 0.5 - Math.random()).slice(0, 3)
    setFeaturedSongs(randomSongs)
    
    // Get 4 songs for trending
    const trendingSongs = [...songs].sort(() => 0.5 - Math.random()).slice(0, 4)
    setTrendingSongs(trendingSongs)
    
    // Get 8 songs for new releases
    const newReleases = [...songs].sort(() => 0.5 - Math.random()).slice(0, 8)
    setNewReleases(newReleases)
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

  // Play featured song
  const playFeaturedSong = (song: typeof songs[0]) => {
    // Find the index of the song in the queue
    const songIndex = songs.findIndex(s => s.id === song.id);
    if (songIndex !== -1) {
      playTrack(songIndex);
    } else {
      // If not found, play the first song
      playTrack(0);
    }
  }

  // Check if user is signed in
  const isUserSignedIn = !!user;

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {/* Hero Section */}
      <motion.div
        className="relative w-full h-[500px] rounded-2xl overflow-hidden mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <Image 
            src="/img developer images/nisha.HEIC"
            alt="VibeFlow Hero - Nisha"
            fill
            className="object-cover"
            priority
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-black to-transparent" 
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 1.2 }}
          />
        </motion.div>
        
        <div className="relative z-10 h-full flex flex-col justify-center p-12">
          <motion.h1 
            className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent max-w-2xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Discover Your Next Favorite Track
          </motion.h1>
          
          <motion.p 
            className="text-gray-300 text-xl mb-8 max-w-xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Stream unlimited music, create playlists, and enjoy an immersive audio experience with VibeFlow.
          </motion.p>
          
          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
              asChild
            >
              <Link href="/discover">
                <Play className="mr-2 h-5 w-5" /> Start Exploring
              </Link>
            </Button>
            {!isUserSignedIn && (
              <Button 
                size="lg" 
                variant="outline"
                className="border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300"
                asChild
              >
                <Link href="/auth">
                  Join the Vibe Tribe
                </Link>
              </Button>
            )}
          </motion.div>
        </div>
        
        <motion.div 
          className="absolute -bottom-10 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </motion.div>

      {/* Membership CTA - Only show when not signed in */}
      {!isUserSignedIn && (
        <motion.div 
          className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-8 rounded-2xl mb-12 backdrop-blur-sm border border-purple-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Join the Vibe Tribe today!</h2>
              <p className="text-gray-300 max-w-md">Sign up now for unlimited access to all features and exclusive content.</p>
            </div>
            <Button 
              size="lg" 
              className="bg-white text-purple-900 hover:bg-gray-100"
              asChild
            >
              <Link href="/auth">
                Sign Up Now
              </Link>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Featured Section */}
      <motion.section 
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-purple-400" size={20} />
            Featured Tracks
          </h2>
          <Link 
            href="/discover" 
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredSongs.map((song, index) => (
            <motion.div
              key={song.id}
              className="relative h-64 rounded-xl overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => playFeaturedSong(song)}
            >
              <Image
                src={song.coverUrl}
                alt={song.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 p-4 w-full">
                <h3 className="text-xl font-bold text-white">{song.title}</h3>
                <p className="text-gray-300">{song.artist}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-purple-600 rounded-full p-4">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Trending Now Section */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-purple-400" size={20} />
            Trending Now
          </h2>
          <Link 
            href="/discover" 
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {trendingSongs.map((song) => (
            <motion.div key={song.id} variants={itemVariants}>
              <SongCard song={song} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* New Releases Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Music className="text-purple-400" size={20} />
            New Releases
          </h2>
          <Link 
            href="/discover" 
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {newReleases.map((song) => (
            <motion.div key={song.id} variants={itemVariants}>
              <SongCard song={song} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  )
}
