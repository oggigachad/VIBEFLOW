"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useMusic } from "@/context/music-context"
import { doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore"
import type { Song } from "@/lib/types"
import { db } from "@/lib/firebase" // Import from our firebase config

// Types for user stats
interface ListeningHistoryItem {
  songId: string
  title: string
  artist: string
  coverUrl: string
  timestamp: Date
}

interface UserStats {
  totalListeningTime: number // in seconds
  songsPlayed: number
  topArtists: {
    name: string
    count: number
  }[]
  topGenres: {
    name: string
    count: number
  }[]
  recentlyPlayed: ListeningHistoryItem[]
  mostPlayed: {
    songId: string
    title: string
    artist: string
    coverUrl: string
    playCount: number
  }[]
}

interface UserStatsContextType {
  userStats: UserStats | null
  isLoading: boolean
  error: string | null
  recentlyPlayed: ListeningHistoryItem[]
  recordPlay: (song: Song) => Promise<void>
  refreshStats: () => Promise<void>
}

const defaultStats: UserStats = {
  totalListeningTime: 0,
  songsPlayed: 0,
  topArtists: [],
  topGenres: [],
  recentlyPlayed: [],
  mostPlayed: []
}

const UserStatsContext = createContext<UserStatsContextType>({
  userStats: null,
  isLoading: true,
  error: null,
  recentlyPlayed: [],
  recordPlay: async () => {},
  refreshStats: async () => {}
})
export function UserStatsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { currentTrack } = useMusic()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [recentlyPlayed, setRecentlyPlayed] = useState<ListeningHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // No need to initialize Firestore here since we're importing it

  // Load user stats on auth change
  useEffect(() => {
    if (user) {
      loadUserStats()
    } else {
      setUserStats(null)
      setIsLoading(false)
    }
  }, [user])

  // Record play when song changes
  useEffect(() => {
    if (currentTrack && user) {
      // Convert Track to Song format
      const song: Song = {
        id: currentTrack.id,
        title: currentTrack.title,
        artist: currentTrack.artist,
        genre: currentTrack.genre || "Unknown",
        coverUrl: currentTrack.coverArt,
        audioUrl: currentTrack.audioUrl,
        duration: currentTrack.duration
      }
      recordPlay(song)
    }
  }, [currentTrack, user])

  // Load user stats from Firestore
  const loadUserStats = async () => {
    if (!user || !db) {
      setError("Firebase not initialized or user not logged in")
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    try {
      // Get user stats document
      const statsRef = doc(db, "userStats", user.id)
      const statsDoc = await getDoc(statsRef)
      
      if (statsDoc.exists()) {
        setUserStats(statsDoc.data() as UserStats)
      } else {
        // Create default stats if none exist
        await setDoc(statsRef, defaultStats)
        setUserStats(defaultStats)
      }
      
      // Get recently played songs
      const historyRef = collection(db, "listeningHistory")
      const historyQuery = query(
        historyRef, 
        where("userId", "==", user.id),
        orderBy("timestamp", "desc"),
        limit(20)
      )
      
      const historySnapshot = await getDocs(historyQuery)
      const history: ListeningHistoryItem[] = []
      
      historySnapshot.forEach(doc => {
        const data = doc.data()
        history.push({
          songId: data.songId,
          title: data.title,
          artist: data.artist,
          coverUrl: data.coverUrl,
          timestamp: data.timestamp.toDate()
        })
      })
      
      setRecentlyPlayed(history)
      setError(null)
    } catch (error) {
      console.error("Error loading user stats:", error)
      setError("Failed to load listening history")
    } finally {
      setIsLoading(false)
    }
  }

  // Record a song play
  const recordPlay = async (song: Song) => {
    if (!user || !db) {
      console.error("Cannot record play: Firebase not initialized or user not logged in")
      return
    }
    
    try {
      // Add to listening history
      const historyRef = collection(db, "listeningHistory")
      await addDoc(historyRef, {
        userId: user.id,
        songId: song.id,
        title: song.title,
        artist: song.artist,
        genre: song.genre,
        coverUrl: song.coverUrl,
        timestamp: serverTimestamp()
      })
      
      // Update user stats
      const statsRef = doc(db, "userStats", user.id)
      const statsDoc = await getDoc(statsRef)
      
      if (statsDoc.exists()) {
        const currentStats = statsDoc.data() as UserStats
        
        // Update total listening time and songs played
        await setDoc(statsRef, {
          ...currentStats,
          totalListeningTime: currentStats.totalListeningTime + song.duration,
          songsPlayed: currentStats.songsPlayed + 1
        }, { merge: true })
      }
      
      // Refresh stats after recording play
      await refreshStats()
    } catch (error) {
      console.error("Error recording play:", error)
      setError("Failed to record play")
    }
  }

  // Refresh user stats
  const refreshStats = async () => {
    if (!user || !db) {
      console.error("Cannot refresh stats: Firebase not initialized or user not logged in")
      return
    }
    
    try {
      // Get recently played songs
      const historyRef = collection(db, "listeningHistory")
      const historyQuery = query(
        historyRef, 
        where("userId", "==", user.id),
        orderBy("timestamp", "desc"),
        limit(20)
      )
      
      const historySnapshot = await getDocs(historyQuery)
      const history: ListeningHistoryItem[] = []
      
      historySnapshot.forEach(doc => {
        const data = doc.data()
        history.push({
          songId: data.songId,
          title: data.title,
          artist: data.artist,
          coverUrl: data.coverUrl,
          timestamp: data.timestamp.toDate()
        })
      })
      
      setRecentlyPlayed(history)
      
      // Calculate top artists and genres
      const allHistoryQuery = query(
        historyRef, 
        where("userId", "==", user.id)
      )
      
      const allHistorySnapshot = await getDocs(allHistoryQuery)
      const artistCounts: Record<string, number> = {}
      const genreCounts: Record<string, number> = {}
      const songCounts: Record<string, { count: number, data: any }> = {}
      
      allHistorySnapshot.forEach(doc => {
        const data = doc.data()
        
        // Count artists
        if (artistCounts[data.artist]) {
          artistCounts[data.artist]++
        } else {
          artistCounts[data.artist] = 1
        }
        
        // Count genres
        if (genreCounts[data.genre]) {
          genreCounts[data.genre]++
        } else {
          genreCounts[data.genre] = 1
        }
        
        // Count songs
        if (songCounts[data.songId]) {
          songCounts[data.songId].count++
        } else {
          songCounts[data.songId] = { 
            count: 1, 
            data: {
              songId: data.songId,
              title: data.title,
              artist: data.artist,
              coverUrl: data.coverUrl
            }
          }
        }
      })
      
      // Convert to arrays and sort
      const topArtists = Object.entries(artistCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      
      const topGenres = Object.entries(genreCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      
      const mostPlayed = Object.values(songCounts)
        .map(item => ({
          ...item.data,
          playCount: item.count
        }))
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, 10)
      
      // Update user stats
      const statsRef = doc(db, "userStats", user.id)
      await setDoc(statsRef, {
        totalListeningTime: userStats?.totalListeningTime || 0,
        songsPlayed: userStats?.songsPlayed || 0,
        topArtists,
        topGenres,
        mostPlayed
      }, { merge: true })
      
      // Update local state
      setUserStats(prev => ({
        ...prev!,
        topArtists,
        topGenres,
        mostPlayed,
        recentlyPlayed: history
      }))
      
    } catch (error) {
      console.error("Error refreshing stats:", error)
      setError("Failed to refresh stats")
    }
  }

  const value = {
    userStats,
    isLoading,
    error,
    recentlyPlayed,
    recordPlay,
    refreshStats
  }
  
  return (
    <UserStatsContext.Provider value={value}>
      {children}
    </UserStatsContext.Provider>
  )
}

export function useUserStats() {
  const context = useContext(UserStatsContext)
  
  if (!context) {
    throw new Error("useUserStats must be used within a UserStatsProvider")
  }
  
  return context
} 