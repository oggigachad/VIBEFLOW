"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { genres, songs, artists } from "@/lib/data"
import SongCard from "@/components/song-card"
import { motion, AnimatePresence } from "framer-motion"
import { useMusic } from "@/context/music-context"
import Image from "next/image"
import Link from "next/link"
import { Play, Headphones, Disc, Sparkles, Search, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function DiscoverPage() {
  const [activeGenre, setActiveGenre] = useState("all")
  const { isPlaying, playTrack, togglePlayPause, queue } = useMusic()
  const { toast } = useToast()
  const [featuredSongs, setFeaturedSongs] = useState<typeof songs>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSongs, setFilteredSongs] = useState<typeof songs>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<typeof songs>([])
  const searchRef = useRef<HTMLDivElement>(null)

  // Set featured songs on mount
  useEffect(() => {
    // Get 3 random songs for the featured section
    const randomSongs = [...songs].sort(() => 0.5 - Math.random()).slice(0, 3)
    setFeaturedSongs(randomSongs)
    setFilteredSongs(songs)
    
    // Ensure "all" genre is selected and songs are displayed by default
    setActiveGenre("all")
  }, [])

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSongs(songs)
      setSearchSuggestions([])
      setShowSuggestions(false)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = songs.filter(
        song => 
          song.title.toLowerCase().includes(query) || 
          song.artist.toLowerCase().includes(query)
      )
      setFilteredSongs(filtered)
      
      // Set search suggestions (limit to 5)
      setSearchSuggestions(filtered.slice(0, 5))
      setShowSuggestions(true)
    }
  }, [searchQuery])
  
  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle suggestion click
  const handleSuggestionClick = (song: typeof songs[0]) => {
    setSearchQuery(song.title)
    setShowSuggestions(false)
    
    // Find the song in the filtered list
    const songIndex = filteredSongs.findIndex(s => s.id === song.id)
    
    // Scroll to the song card if found
    if (songIndex >= 0) {
      setTimeout(() => {
        const songElements = document.querySelectorAll('[data-song-id]')
        songElements[songIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setShowSuggestions(false)
  }

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
    const songIndex = queue.findIndex(track => track.id === song.id);
    
    if (songIndex !== -1) {
      playTrack(songIndex);
    } else {
      // Try to find similar track in the queue
      const similarTrack = queue.find(track => 
        track.title.toLowerCase() === song.title.toLowerCase() || 
        track.artist.toLowerCase() === song.artist.toLowerCase()
      );
      
      if (similarTrack) {
        const similarIndex = queue.findIndex(track => track.id === similarTrack.id);
        playTrack(similarIndex);
      } else {
        // If not found, play the first track
        playTrack(0);
        toast({
          title: "Track not available",
          description: `"${song.title}" isn't currently in the queue`,
          duration: 3000,
        });
      }
    }
    
    if (!isPlaying) {
      togglePlayPause();
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Welcome to VibeFlow
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Discover new music, create playlists, and enjoy your favorite tracks with our immersive audio experience.
        </p>
      </motion.div>

      {/* Search Bar */}
      <div ref={searchRef} className="relative mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for songs or artists..."
            className="w-full py-3 px-5 pl-12 bg-black/30 border border-purple-500/30 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() !== "" && setShowSuggestions(true)}
          />
          <Search 
            className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Search Suggestions Dropdown */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 mt-2 py-2 bg-black/90 backdrop-blur-lg border border-purple-500/30 rounded-xl shadow-xl z-50 max-h-72 overflow-auto"
          >
            {searchSuggestions.map((song) => (
              <div 
                key={song.id}
                onClick={() => handleSuggestionClick(song)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-purple-500/10 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 relative rounded-md overflow-hidden bg-purple-900/30 flex-shrink-0">
                  <Image 
                    src={song.coverUrl} 
                    alt={song.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{song.title}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>
                <div className="text-xs text-gray-500 px-2 py-1 rounded-full bg-gray-800">
                  {genres.find(g => g.id === song.genre)?.name || song.genre}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

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
            href="/artists" 
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <span>View All Artists</span>
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
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
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

      {/* Browse by Genre */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Disc className="text-purple-400" size={20} />
          Browse by Genre
        </h2>
        
        <Tabs defaultValue="all" onValueChange={setActiveGenre}>
          <div className="relative mb-8 overflow-x-auto pb-2">
            <TabsList className="w-full justify-start h-auto p-1 bg-black/30 backdrop-blur-md rounded-xl border border-purple-500/20">
              <TabsTrigger
                value="all"
                className="px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg transition-all"
              >
                All Genres
              </TabsTrigger>
              {genres.map((genre) => (
                <TabsTrigger
                  key={genre.id}
                  value={genre.id}
                  className="px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg transition-all"
                >
                  {genre.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <GenreBackground genre="all" isPlaying={isPlaying} />
            <AnimatePresence mode="wait" initial={false}>
              {filteredSongs.length > 0 ? (
                <motion.div 
                  key="songs-grid"
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredSongs.map((song) => (
                    <motion.div key={song.id} variants={itemVariants}>
                      <SongCard song={song} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="no-songs"
                  className="flex flex-col items-center justify-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Headphones className="h-16 w-16 text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium text-gray-300">No songs found</h3>
                  <p className="text-gray-500">Try searching for something else</p>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {genres.map((genre) => (
            <TabsContent key={genre.id} value={genre.id} className="mt-0">
              <GenreBackground genre={genre.id} isPlaying={isPlaying} />
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredSongs
                  .filter((song) => song.genre === genre.id)
                  .map((song) => (
                    <motion.div key={song.id} variants={itemVariants}>
                      <SongCard song={song} />
                    </motion.div>
                  ))}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.section>
    </div>
  )
}

function GenreBackground({ genre, isPlaying }: { genre: string; isPlaying: boolean }) {
  const getGradient = () => {
    switch (genre) {
      case "pop":
        return "from-pink-500 to-purple-500"
      case "rock":
        return "from-red-500 to-orange-500"
      case "hiphop":
        return "from-blue-500 to-indigo-500"
      case "electronic":
        return "from-cyan-500 to-blue-500"
      case "jazz":
        return "from-amber-500 to-yellow-500"
      case "rnb":
        return "from-indigo-500 to-violet-500"
      default:
        return "from-purple-500 to-blue-500"
    }
  }

  return (
    <motion.div
      className={`absolute top-0 left-0 w-full h-96 -z-10 bg-gradient-to-r ${getGradient()} opacity-10`}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 0.1,
        scale: isPlaying ? [1, 1.02, 1] : 1,
      }}
      transition={{
        opacity: { duration: 0.5 },
        scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
      }}
    />
  )
}
