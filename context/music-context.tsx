"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { usePreferences } from "@/hooks/use-preferences"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverArt: string
  audioUrl: string
  year?: number
  genre?: string
}

interface MusicContextType {
  currentTrack: Track | null
  queue: Track[]
  currentTrackIndex: number
  isPlaying: boolean
  progress: number
  duration: number
  volume: number
  isMuted: boolean
  isShuffleEnabled: boolean
  isRepeatEnabled: boolean
  likedTracks: string[]
  followedArtists: string[]
  playTrack: (index: number) => void
  pauseTrack: () => void
  resumeTrack: () => void
  togglePlayPause: () => void
  nextTrack: () => void
  previousTrack: () => void
  seekTo: (time: number) => void
  setProgress: (progress: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  addToQueue: (track: Track) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  moveTrackUp: (index: number) => void
  moveTrackDown: (index: number) => void
  isLiked: (id: string) => boolean
  toggleLikeSong: (track: Track) => boolean
  downloadTrack: (track: Track) => void
  followArtist: (artistId: string) => boolean
  unfollowArtist: (artistId: string) => void
  isFollowing: (artistId: string) => boolean
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

// Sample tracks for initial load - only including songs that actually exist in the songs folder
const sampleTracks: Track[] = [
  {
    id: "track1",
    title: "Moonlight",
    artist: "XXXTENTACION",
    album: "?",
    duration: 135,
    coverArt: "/covers for songs/moonlight.jpeg",
    audioUrl: "/songs/moonlight.mp3",
    year: 2018,
    genre: "Hip Hop"
  },
  {
    id: "track2",
    title: "MONTERO (Call Me By Your Name)",
    artist: "Lil Nas X",
    album: "MONTERO",
    duration: 137,
    coverArt: "/covers for songs/montero.png",
    audioUrl: "/songs/montero.mp3",
    year: 2021,
    genre: "Pop"
  },
  {
    id: "track3",
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    duration: 167,
    coverArt: "/covers for songs/as it was.jpeg",
    audioUrl: "/songs/as-it-was.mp3",
    year: 2022,
    genre: "Pop"
  },
  {
    id: "track4",
    title: "Die For You",
    artist: "The Weeknd",
    album: "Starboy",
    duration: 260,
    coverArt: "/covers for songs/die for you.jpeg",
    audioUrl: "/songs/die-for-you.mp3",
    year: 2016,
    genre: "R&B"
  },
  {
    id: "track5",
    title: "Kill Bill",
    artist: "SZA",
    album: "SOS",
    duration: 153,
    coverArt: "/covers for songs/kill bill.jpg",
    audioUrl: "/songs/kill-bill.mp3",
    year: 2022,
    genre: "R&B"
  },
  {
    id: "track6",
    title: "Main Phir Bhi Tumko Chahunga",
    artist: "Arijit Singh",
    album: "Half Girlfriend",
    duration: 320,
    coverArt: "/covers for songs/main phir bhi tumko chahunga.jpg",
    audioUrl: "/songs/main-phir-bhi-tumko-chahunga.mp3",
    year: 2017,
    genre: "Bollywood"
  },
  {
    id: "track7",
    title: "The Box",
    artist: "Roddy Ricch",
    album: "Please Excuse Me For Being Antisocial",
    duration: 196,
    coverArt: "/covers for songs/the box.jpeg",
    audioUrl: "/songs/the-box.mp3",
    year: 2019,
    genre: "Hip Hop"
  },
  {
    id: "track8",
    title: "Starboy",
    artist: "The Weeknd ft. Daft Punk",
    album: "Starboy",
    duration: 230,
    coverArt: "/covers for songs/starboy.jpg",
    audioUrl: "/songs/Starboy.mp3",
    year: 2016,
    genre: "R&B"
  },
  {
    id: "track9",
    title: "Paint The Town Red",
    artist: "Doja Cat",
    album: "Scarlet",
    duration: 233,
    coverArt: "/covers for songs/paint town.jpg",
    audioUrl: "/songs/paint-the-town-red.mp3",
    year: 2023,
    genre: "Hip Hop"
  },
  {
    id: "track10",
    title: "Calm Down",
    artist: "Rema & Selena Gomez",
    album: "Rave & Roses",
    duration: 239,
    coverArt: "/covers for songs/calm down.jpeg",
    audioUrl: "/songs/calm-down.mp3",
    year: 2022,
    genre: "Afrobeats"
  },
  {
    id: "track11",
    title: "Love Nwantiti",
    artist: "CKay",
    album: "CKay the First",
    duration: 145,
    coverArt: "/covers for songs/love nwantiti.jpeg",
    audioUrl: "/songs/love-nwantiti.mp3",
    year: 2019,
    genre: "Afrobeats"
  },
  {
    id: "track12",
    title: "Espresso",
    artist: "Sabrina Carpenter",
    album: "Emails I Can't Send",
    duration: 136,
    coverArt: "/covers for songs/espresso.jpg",
    audioUrl: "/songs/espresso.mp3",
    year: 2023,
    genre: "Pop"
  },
  {
    id: "track13",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: 203,
    coverArt: "/covers for songs/levitating.webp",
    audioUrl: "/songs/levitating.mp3",
    year: 2020,
    genre: "Pop"
  },
  {
    id: "track14",
    title: "Finding Her",
    artist: "AP Dhillon",
    album: "Not by Chance",
    duration: 244,
    coverArt: "/covers for songs/finding her.jpg",
    audioUrl: "/songs/finding-her.mp3",
    year: 2021,
    genre: "Punjabi"
  },
  {
    id: "track15",
    title: "Let Me Love You",
    artist: "DJ Snake ft. Justin Bieber",
    album: "Encore",
    duration: 206,
    coverArt: "/covers for songs/let me love you.jpg",
    audioUrl: "/songs/let-me-love-you.mp3",
    year: 2016,
    genre: "EDM"
  },
  {
    id: "track16",
    title: "Paaro",
    artist: "Raftaar & Yunan",
    album: "Mr. Nair",
    duration: 176,
    coverArt: "/covers for songs/paaro.jpeg",
    audioUrl: "/songs/paaro.mp3",
    year: 2020,
    genre: "Hip Hop"
  }
]

export function MusicProvider({ children }: { children: ReactNode }) {
  const { preferences, updatePreferences } = usePreferences()
  const { user } = useAuth()
  const router = useRouter()
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(sampleTracks[0])
  const [queue, setQueue] = useState<Track[]>(sampleTracks)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(currentTrack?.duration || 0)
  const [volume, setVolume] = useState(preferences.volume)
  const [isMuted, setIsMuted] = useState(preferences.isMuted)
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false)
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false)
  const [likedTracks, setLikedTracks] = useState<string[]>([])
  const [followedArtists, setFollowedArtists] = useState<string[]>([])
  
  // Update track duration when current track changes
  useEffect(() => {
    if (currentTrack) {
      setDuration(currentTrack.duration)
    }
  }, [currentTrack])
  
  // Remove simulated progress updates with interval
  // and replace with real progress updates from audio elements
  useEffect(() => {
    if (!isPlaying && currentTrack) {
      // When paused, ensure state is consistent but don't keep updating
      return;
    }
    
    // The actual progress updates will now come from the audio element's
    // timeupdate events in the player components, not from an interval here
    
  }, [isPlaying, currentTrack]);
  
  // Handle volume changes from preferences
  useEffect(() => {
    setVolume(preferences.volume)
    setIsMuted(preferences.isMuted)
  }, [preferences.volume, preferences.isMuted])
  
  // Load liked tracks from localStorage on mount
  useEffect(() => {
    const storedLikedTracks = typeof window !== "undefined"
      ? localStorage.getItem("likedTracks")
      : null
      
    if (storedLikedTracks) {
      try {
        const parsedLikedTracks = JSON.parse(storedLikedTracks)
        setLikedTracks(parsedLikedTracks)
      } catch (error) {
        console.error("Error parsing liked tracks:", error)
      }
    }
  }, [])
  
  // Save liked tracks to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("likedTracks", JSON.stringify(likedTracks))
    }
  }, [likedTracks])
  
  // Load followed artists from localStorage on mount
  useEffect(() => {
    const storedFollowedArtists = typeof window !== "undefined"
      ? localStorage.getItem("followedArtists")
      : null
      
    if (storedFollowedArtists) {
      try {
        const parsedFollowedArtists = JSON.parse(storedFollowedArtists)
        setFollowedArtists(parsedFollowedArtists)
      } catch (error) {
        console.error("Error parsing followed artists:", error)
      }
    }
  }, [])
  
  // Save followed artists to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("followedArtists", JSON.stringify(followedArtists))
    }
  }, [followedArtists])
  
  // Handle track ending
  const handleTrackEnd = () => {
    if (isRepeatEnabled) {
      // Restart the current track
      setProgress(0)
    } else if (currentTrackIndex < queue.length - 1) {
      // Play next track
      playTrack(currentTrackIndex + 1)
    } else {
      // End of queue
      setIsPlaying(false)
      setProgress(0)
    }
  }
  
  const playTrack = (index: number) => {
    try {
      if (index >= 0 && index < queue.length) {
        // Stop current playback to prevent multiple songs playing simultaneously
        setIsPlaying(false)
        setProgress(0)
        
        // Small delay to ensure audio has stopped before changing track
        setTimeout(() => {
          setCurrentTrackIndex(index)
          setCurrentTrack(queue[index])
          setIsPlaying(true)
          
          // Reset duration to the expected value from the track
          // The audio element will update this when loaded
          setDuration(queue[index].duration)
          
          // Create a one-time check if the audio started playing
          // If not, we'll retry with a longer timeout
          setTimeout(() => {
            if (!isPlaying) {
              console.log("Auto-retry play track")
              setIsPlaying(true)
            }
          }, 300) 
        }, 50)
      }
    } catch (error) {
      console.error("Error playing track:", error)
    }
  }
  
  const pauseTrack = () => {
    setIsPlaying(false)
  }
  
  const resumeTrack = () => {
    setIsPlaying(true)
  }
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }
  
  const nextTrack = () => {
    if (currentTrackIndex < queue.length - 1) {
      playTrack(currentTrackIndex + 1)
    } else if (isRepeatEnabled) {
      playTrack(0)
    }
  }
  
  const previousTrack = () => {
    // If we're past the first few seconds, restart the current track
    if (progress > 10) {
      setProgress(0)
    } else if (currentTrackIndex > 0) {
      // Otherwise go to previous track
      playTrack(currentTrackIndex - 1)
    } else if (currentTrackIndex === 0 && isRepeatEnabled && queue.length > 0) {
      // If on first track with repeat enabled, go to the last track
      playTrack(queue.length - 1)
    }
  }
  
  const seekTo = (time: number) => {
    if (time >= 0 && time <= duration) {
      // Calculate progress as percentage
      const newProgress = (time / duration) * 100;
      setProgress(newProgress);
    }
  }
  
  const setVolumeAndUpdate = (newVolume: number) => {
    setVolume(newVolume)
    updatePreferences({ volume: newVolume })
  }
  
  const toggleMuteAndUpdate = () => {
    setIsMuted(!isMuted)
    updatePreferences({ isMuted: !isMuted })
  }
  
  const toggleShuffle = () => {
    setIsShuffleEnabled(!isShuffleEnabled)
    
    if (!isShuffleEnabled) {
      // Remember original queue order for when we toggle shuffle off
      const originalQueue = [...queue]
      localStorage.setItem("originalQueue", JSON.stringify(originalQueue))
      
      // Implement Fisher-Yates shuffle algorithm but keep current track first
      const currentTrack = queue[currentTrackIndex]
      
      // Remove current track from the array before shuffling
      const tracksToShuffle = [...queue.filter((_, i) => i !== currentTrackIndex)]
      
      // Shuffle the remaining tracks
      for (let i = tracksToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[tracksToShuffle[i], tracksToShuffle[j]] = [tracksToShuffle[j], tracksToShuffle[i]]
      }
      
      // Put current track at the beginning
      const shuffledQueue = [currentTrack, ...tracksToShuffle]
      setQueue(shuffledQueue)
      setCurrentTrackIndex(0)
    } else {
      // Restore original queue order
      const storedOriginalQueue = localStorage.getItem("originalQueue")
      if (storedOriginalQueue) {
        try {
          const originalQueue = JSON.parse(storedOriginalQueue)
          setQueue(originalQueue)
          // Find the current track in the original queue
          const currentId = currentTrack?.id
          const newIndex = originalQueue.findIndex((track: Track) => track.id === currentId)
          setCurrentTrackIndex(newIndex !== -1 ? newIndex : 0)
        } catch (error) {
          console.error("Error restoring original queue:", error)
          setQueue(sampleTracks)
          setCurrentTrackIndex(0)
        }
      } else {
        setQueue(sampleTracks)
        setCurrentTrackIndex(0)
      }
    }
  }
  
  const toggleRepeat = () => {
    setIsRepeatEnabled(!isRepeatEnabled)
  }
  
  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track])
  }
  
  const removeFromQueue = (index: number) => {
    if (index < 0 || index >= queue.length) return
    
    // Create a new queue without the track at the specified index
    const newQueue = [...queue.slice(0, index), ...queue.slice(index + 1)]
    setQueue(newQueue)
    
    // Adjust current track index if necessary
    if (index < currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    } else if (index === currentTrackIndex) {
      // If removing current track, play next track
      if (newQueue.length > 0) {
        const newIndex = Math.min(currentTrackIndex, newQueue.length - 1)
        setCurrentTrackIndex(newIndex)
        setCurrentTrack(newQueue[newIndex])
      } else {
        setCurrentTrackIndex(-1)
        setCurrentTrack(null)
        setIsPlaying(false)
      }
    }
  }
  
  const clearQueue = () => {
    setQueue([])
    setCurrentTrack(null)
    setCurrentTrackIndex(-1)
    setIsPlaying(false)
  }
  
  const moveTrackUp = (index: number) => {
    if (index <= 0 || index >= queue.length) return
    
    const newQueue = [...queue]
    const temp = newQueue[index]
    newQueue[index] = newQueue[index - 1]
    newQueue[index - 1] = temp
    
    setQueue(newQueue)
    
    // Adjust current track index if necessary
    if (index === currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    } else if (index - 1 === currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex + 1)
    }
  }
  
  const moveTrackDown = (index: number) => {
    if (index < 0 || index >= queue.length - 1) return
    
    const newQueue = [...queue]
    const temp = newQueue[index]
    newQueue[index] = newQueue[index + 1]
    newQueue[index + 1] = temp
    
    setQueue(newQueue)
    
    // Adjust current track index if necessary
    if (index === currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex + 1)
    } else if (index + 1 === currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    }
  }
  
  // Add isLiked function
  const isLiked = (id: string): boolean => {
    return likedTracks.includes(id)
  }
  
  // Add toggleLikeSong function
  const toggleLikeSong = (track: Track): boolean => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like songs",
        variant: "destructive"
      })
      
      // Redirect to auth page after a short delay
      setTimeout(() => {
        router.push("/auth")
      }, 1500);
      
      return false;
    }
    
    if (isLiked(track.id)) {
      setLikedTracks(prev => prev.filter(id => id !== track.id))
      return false
    } else {
      setLikedTracks(prev => [...prev, track.id])
      return true
    }
  }
  
  // Handle file download
  const downloadTrack = (track: Track) => {
    if (!track) return
    
    // Create a link element to trigger the download
    const link = document.createElement('a')
    link.href = track.audioUrl
    link.download = `${track.artist} - ${track.title}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Add isFollowing function
  const isFollowing = (artistId: string): boolean => {
    return followedArtists.includes(artistId)
  }
  
  // Add followArtist function
  const followArtist = (artistId: string): boolean => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to follow artists",
        variant: "destructive"
      })
      
      // Redirect to auth page after a short delay
      setTimeout(() => {
        router.push("/auth")
      }, 1500);
      
      return false;
    }
    
    if (isFollowing(artistId)) {
      return false
    }
    
    setFollowedArtists(prev => [...prev, artistId])
    
    toast({
      title: "Artist Followed",
      description: "You are now following this artist",
      variant: "default"
    })
    
    return true
  }
  
  // Add unfollowArtist function
  const unfollowArtist = (artistId: string): void => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to unfollow artists",
        variant: "destructive"
      })
      
      // Redirect to auth page after a short delay
      setTimeout(() => {
        router.push("/auth")
      }, 1500);
      
      return;
    }
    
    setFollowedArtists(prev => prev.filter(id => id !== artistId))
    
    toast({
      title: "Artist Unfollowed",
      description: "You are no longer following this artist",
      variant: "default"
    })
  }
  
  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        queue,
        currentTrackIndex,
        isPlaying,
        progress,
        duration,
        volume,
        isMuted,
        isShuffleEnabled,
        isRepeatEnabled,
        likedTracks,
        followedArtists,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlayPause,
        nextTrack,
        previousTrack,
        seekTo,
        setProgress,
        setDuration,
        setVolume: setVolumeAndUpdate,
        toggleMute: toggleMuteAndUpdate,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue,
        moveTrackUp,
        moveTrackDown,
        isLiked,
        toggleLikeSong,
        downloadTrack,
        followArtist,
        unfollowArtist,
        isFollowing
      }}
    >
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const context = useContext(MusicContext)
  
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider")
  }
  
  return context
}
