"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "@/context/auth-context"
import { useMusic } from "@/context/music-context"
import { toast } from "@/components/ui/use-toast"
import { Track } from "@/context/music-context"

interface Playlist {
  id: string
  name: string
  description: string
  tracks: Track[]
  coverImage?: string
  createdAt: Date
  updatedAt: Date
}

interface LibraryContextType {
  playlists: Playlist[]
  likedSongs: Track[]
  createPlaylist: (name: string, description?: string) => Playlist
  addToPlaylist: (playlistId: string, track: Track) => boolean
  removeFromPlaylist: (playlistId: string, trackId: string) => boolean
  deletePlaylist: (playlistId: string) => boolean
  renamePlaylist: (playlistId: string, newName: string) => boolean
  updatePlaylistDescription: (playlistId: string, description: string) => boolean
  isTrackInPlaylist: (playlistId: string, trackId: string) => boolean
  getPlaylist: (playlistId: string) => Playlist | undefined
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const { likedTracks, queue } = useMusic()
  
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [likedSongs, setLikedSongs] = useState<Track[]>([])
  
  // Initialize with default playlists
  useEffect(() => {
    if (isAuthenticated) {
      // Try to load playlists from localStorage
      const storedPlaylists = typeof window !== "undefined"
        ? localStorage.getItem(`playlists_${user?.uid}`)
        : null
      
      if (storedPlaylists) {
        try {
          const parsedPlaylists = JSON.parse(storedPlaylists)
          // Convert string dates back to Date objects
          const playlistsWithDates = parsedPlaylists.map((playlist: any) => ({
            ...playlist,
            createdAt: new Date(playlist.createdAt),
            updatedAt: new Date(playlist.updatedAt)
          }))
          setPlaylists(playlistsWithDates)
        } catch (error) {
          console.error("Error parsing playlists:", error)
          initializeDefaultPlaylists()
        }
      } else {
        initializeDefaultPlaylists()
      }
    }
  }, [isAuthenticated, user])
  
  // Update liked songs whenever likedTracks changes
  useEffect(() => {
    if (likedTracks.length > 0) {
      // Convert likedTracks (which are IDs) to actual Track objects
      const likedSongsArray = likedTracks
        .map(id => queue.find(track => track.id === id))
        .filter(track => track !== undefined) as Track[]
      
      setLikedSongs(likedSongsArray)
    } else {
      setLikedSongs([])
    }
  }, [likedTracks, queue])
  
  // Save playlists to localStorage whenever they change
  useEffect(() => {
    if (isAuthenticated && playlists.length > 0) {
      localStorage.setItem(`playlists_${user?.uid}`, JSON.stringify(playlists))
    }
  }, [playlists, isAuthenticated, user])
  
  // Initialize with default playlists
  const initializeDefaultPlaylists = () => {
    const defaultPlaylists: Playlist[] = [
      {
        id: "favorites",
        name: "Favorites",
        description: "Your favorite tracks",
        tracks: [],
        coverImage: "/playlists/favorites.jpg",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "recently-played",
        name: "Recently Played",
        description: "Tracks you've listened to recently",
        tracks: [],
        coverImage: "/playlists/recently-played.jpg",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    
    setPlaylists(defaultPlaylists)
  }
  
  // Create a new playlist
  const createPlaylist = (name: string, description: string = "") => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create playlists",
        variant: "destructive"
      })
      throw new Error("User must be authenticated to create playlists")
    }
    
    const newPlaylist: Playlist = {
      id: `playlist_${Date.now()}`,
      name,
      description,
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setPlaylists(prev => [...prev, newPlaylist])
    
    toast({
      title: "Playlist Created",
      description: `"${name}" has been added to your library`
    })
    
    return newPlaylist
  }
  
  // Add a track to a playlist
  const addToPlaylist = (playlistId: string, track: Track) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add songs to playlists",
        variant: "destructive"
      })
      return false
    }
    
    const playlistIndex = playlists.findIndex(p => p.id === playlistId)
    
    if (playlistIndex === -1) {
      toast({
        title: "Playlist Not Found",
        description: "The selected playlist couldn't be found",
        variant: "destructive"
      })
      return false
    }
    
    // Check if track already exists in the playlist
    if (playlists[playlistIndex].tracks.some(t => t.id === track.id)) {
      toast({
        title: "Already Added",
        description: `"${track.title}" is already in this playlist`
      })
      return false
    }
    
    const updatedPlaylists = [...playlists]
    updatedPlaylists[playlistIndex].tracks.push(track)
    updatedPlaylists[playlistIndex].updatedAt = new Date()
    
    setPlaylists(updatedPlaylists)
    
    toast({
      title: "Added to Playlist",
      description: `"${track.title}" has been added to "${playlists[playlistIndex].name}"`
    })
    
    return true
  }
  
  // Remove a track from a playlist
  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    if (!isAuthenticated) return false
    
    const playlistIndex = playlists.findIndex(p => p.id === playlistId)
    
    if (playlistIndex === -1) return false
    
    const updatedPlaylists = [...playlists]
    updatedPlaylists[playlistIndex].tracks = updatedPlaylists[playlistIndex].tracks.filter(
      track => track.id !== trackId
    )
    updatedPlaylists[playlistIndex].updatedAt = new Date()
    
    setPlaylists(updatedPlaylists)
    
    toast({
      title: "Removed from Playlist",
      description: "The track has been removed from the playlist"
    })
    
    return true
  }
  
  // Delete a playlist
  const deletePlaylist = (playlistId: string) => {
    if (!isAuthenticated) return false
    
    // Prevent deletion of default playlists
    if (playlistId === "favorites" || playlistId === "recently-played") {
      toast({
        title: "Cannot Delete",
        description: "Default playlists cannot be deleted",
        variant: "destructive"
      })
      return false
    }
    
    const playlistIndex = playlists.findIndex(p => p.id === playlistId)
    
    if (playlistIndex === -1) return false
    
    const playlistName = playlists[playlistIndex].name
    const updatedPlaylists = playlists.filter(p => p.id !== playlistId)
    
    setPlaylists(updatedPlaylists)
    
    toast({
      title: "Playlist Deleted",
      description: `"${playlistName}" has been deleted from your library`
    })
    
    return true
  }
  
  // Rename a playlist
  const renamePlaylist = (playlistId: string, newName: string) => {
    if (!isAuthenticated) return false
    
    const playlistIndex = playlists.findIndex(p => p.id === playlistId)
    
    if (playlistIndex === -1) return false
    
    const updatedPlaylists = [...playlists]
    updatedPlaylists[playlistIndex].name = newName
    updatedPlaylists[playlistIndex].updatedAt = new Date()
    
    setPlaylists(updatedPlaylists)
    
    toast({
      title: "Playlist Renamed",
      description: `Playlist has been renamed to "${newName}"`
    })
    
    return true
  }
  
  // Update a playlist's description
  const updatePlaylistDescription = (playlistId: string, description: string) => {
    if (!isAuthenticated) return false
    
    const playlistIndex = playlists.findIndex(p => p.id === playlistId)
    
    if (playlistIndex === -1) return false
    
    const updatedPlaylists = [...playlists]
    updatedPlaylists[playlistIndex].description = description
    updatedPlaylists[playlistIndex].updatedAt = new Date()
    
    setPlaylists(updatedPlaylists)
    
    toast({
      title: "Playlist Updated",
      description: "Playlist description has been updated"
    })
    
    return true
  }
  
  // Check if a track is in a playlist
  const isTrackInPlaylist = (playlistId: string, trackId: string) => {
    const playlist = playlists.find(p => p.id === playlistId)
    
    if (!playlist) return false
    
    return playlist.tracks.some(track => track.id === trackId)
  }
  
  // Get a specific playlist
  const getPlaylist = (playlistId: string) => {
    return playlists.find(p => p.id === playlistId)
  }
  
  return (
    <LibraryContext.Provider
      value={{
        playlists,
        likedSongs,
        createPlaylist,
        addToPlaylist,
        removeFromPlaylist,
        deletePlaylist,
        renamePlaylist,
        updatePlaylistDescription,
        isTrackInPlaylist,
        getPlaylist
      }}
    >
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibrary() {
  const context = useContext(LibraryContext)
  
  if (context === undefined) {
    throw new Error("useLibrary must be used within a LibraryProvider")
  }
  
  return context
} 