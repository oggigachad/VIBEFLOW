"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { UploadCloud, Music, X, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useMusic } from "@/context/music-context"
import { Track } from "@/context/music-context"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function SongUploader() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [songFile, setSongFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [lyricsText, setLyricsText] = useState("")
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [songTitle, setSongTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [album, setAlbum] = useState("")
  const [genre, setGenre] = useState("")
  
  const songInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  
  const { addToQueue } = useMusic()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  
  const handleSongChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!file.type.includes('audio')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an audio file",
          variant: "destructive"
        })
        return
      }
      
      setSongFile(file)
      
      // Try to extract title from filename
      const fileName = file.name.replace(/\.[^/.]+$/, "") // Remove extension
      if (!songTitle) {
        setSongTitle(fileName)
      }
    }
  }
  
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!file.type.includes('image')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file",
          variant: "destructive"
        })
        return
      }
      
      setCoverFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setCoverPreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }
  
  const clearCover = () => {
    setCoverFile(null)
    setCoverPreview(null)
    if (coverInputRef.current) {
      coverInputRef.current.value = ""
    }
  }
  
  const clearSong = () => {
    setSongFile(null)
    if (songInputRef.current) {
      songInputRef.current.value = ""
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }
    
    if (!songFile) {
      toast({
        title: "Song Required",
        description: "Please upload an audio file",
        variant: "destructive"
      })
      return
    }
    
    if (!songTitle || !artist) {
      toast({
        title: "Missing Information",
        description: "Title and artist are required",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Create object URLs for the files
      const songUrl = URL.createObjectURL(songFile)
      let coverUrl = "/covers for songs/default-cover.jpg" // Default cover
      
      if (coverFile) {
        coverUrl = URL.createObjectURL(coverFile)
      }
      
      // Create a unique ID for the track
      const trackId = `user_track_${Date.now()}`
      
      // Create the track object
      const newTrack: Track = {
        id: trackId,
        title: songTitle,
        artist: artist,
        album: album || "Unknown Album",
        duration: 0, // We'll update this when the audio loads
        coverArt: coverUrl,
        audioUrl: songUrl,
        genre: genre || "Unknown",
        year: new Date().getFullYear()
      }
      
      // Create an audio element to get the duration
      const audio = new Audio(songUrl)
      audio.addEventListener('loadedmetadata', () => {
        // Update the track with the correct duration
        newTrack.duration = Math.round(audio.duration)
        
        // Store lyrics if provided
        if (lyricsText.trim()) {
          localStorage.setItem(`lyrics_${trackId}`, lyricsText.trim())
        }
        
        // Add the track to the queue
        addToQueue(newTrack)
        
        // Save the track to localStorage for persistence
        const userTracks = JSON.parse(localStorage.getItem('userTracks') || '[]')
        userTracks.push({
          ...newTrack,
          // We can't store the object URLs in localStorage, so we'll need to handle this differently
          // This is just a marker that we need to recreate the URLs when loading
          isUserTrack: true
        })
        localStorage.setItem('userTracks', JSON.stringify(userTracks))
        
        // Save the actual files to IndexedDB for persistence
        // This is a simplification - in a real app, you'd want a more robust solution
        if (window.indexedDB) {
          const request = window.indexedDB.open("VibeFlowUserMedia", 1)
          
          request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains("songs")) {
              db.createObjectStore("songs")
            }
            if (!db.objectStoreNames.contains("covers")) {
              db.createObjectStore("covers")
            }
            if (!db.objectStoreNames.contains("lyrics")) {
              db.createObjectStore("lyrics")
            }
          }
          
          request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            const transaction = db.transaction(["songs", "covers", "lyrics"], "readwrite")
            
            // Store the song
            const songStore = transaction.objectStore("songs")
            songStore.put(songFile, trackId)
            
            // Store the cover if exists
            if (coverFile) {
              const coverStore = transaction.objectStore("covers")
              coverStore.put(coverFile, trackId)
            }
            
            // Store the lyrics if exists
            if (lyricsText.trim()) {
              const lyricsStore = transaction.objectStore("lyrics")
              lyricsStore.put(lyricsText.trim(), trackId)
            }
            
            transaction.oncomplete = () => {
              setIsLoading(false)
              setOpen(false)
              clearForm()
              
              toast({
                title: "Song Uploaded",
                description: `"${songTitle}" has been added to your library`,
              })
            }
          }
        } else {
          // If IndexedDB is not available, just close the dialog
          setIsLoading(false)
          setOpen(false)
          clearForm()
          
          toast({
            title: "Song Added",
            description: `"${songTitle}" has been added to your queue`,
          })
        }
      })
      
      audio.addEventListener('error', () => {
        setIsLoading(false)
        toast({
          title: "Error Loading Audio",
          description: "There was a problem with the audio file",
          variant: "destructive"
        })
      })
    } catch (error) {
      console.error("Error uploading song:", error)
      setIsLoading(false)
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your song",
        variant: "destructive"
      })
    }
  }
  
  const clearForm = () => {
    setSongFile(null)
    setCoverFile(null)
    setCoverPreview(null)
    setSongTitle("")
    setArtist("")
    setAlbum("")
    setGenre("")
    setLyricsText("")
    if (songInputRef.current) songInputRef.current.value = ""
    if (coverInputRef.current) coverInputRef.current.value = ""
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 w-full mt-4 border-dashed border-blue-500/50 hover:bg-blue-500/10"
        >
          <UploadCloud size={16} />
          Upload Song
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/90 backdrop-blur-lg border border-purple-500/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upload Your Song</DialogTitle>
          <DialogDescription>
            Add your own music to your personal library
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="songFile">Song File (MP3, WAV, etc.)</Label>
                <div className="relative">
                  <Input
                    id="songFile"
                    type="file"
                    ref={songInputRef}
                    accept="audio/*"
                    onChange={handleSongChange}
                    className="hidden"
                  />
                  <div 
                    className={`h-20 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer 
                      ${songFile ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-500/50'}`}
                    onClick={() => songInputRef.current?.click()}
                  >
                    {songFile ? (
                      <div className="flex items-center justify-between w-full px-4">
                        <div className="flex items-center">
                          <Music className="h-6 w-6 mr-2 text-purple-400" />
                          <span className="truncate">{songFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSong();
                          }}
                          className="p-1 rounded-full hover:bg-gray-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <UploadCloud className="h-6 w-6 mb-1 text-gray-400" />
                        <span className="text-gray-400 text-sm">Click to upload audio</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="Song title"
                    required
                    className="bg-black/50 border-purple-500/30 focus:border-purple-500"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist</Label>
                  <Input
                    id="artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Artist name"
                    required
                    className="bg-black/50 border-purple-500/30 focus:border-purple-500"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="album">Album (Optional)</Label>
                    <Input
                      id="album"
                      value={album}
                      onChange={(e) => setAlbum(e.target.value)}
                      placeholder="Album name"
                      className="bg-black/50 border-purple-500/30 focus:border-purple-500"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre (Optional)</Label>
                    <Input
                      id="genre"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      placeholder="Genre"
                      className="bg-black/50 border-purple-500/30 focus:border-purple-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image (Optional)</Label>
                <div className="relative">
                  <Input
                    id="coverImage"
                    type="file"
                    ref={coverInputRef}
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                  
                  {coverPreview ? (
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-purple-500/30">
                      <Image
                        src={coverPreview}
                        alt="Cover preview"
                        width={300}
                        height={300}
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={clearCover}
                        className="absolute top-2 right-2 p-1 bg-black/70 rounded-full hover:bg-gray-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500/50"
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <UploadCloud className="h-8 w-8 mb-2 text-gray-400" />
                      <span className="text-gray-400 text-sm text-center">Click to upload cover art</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lyrics">Lyrics (Optional)</Label>
                <Textarea
                  id="lyrics"
                  value={lyricsText}
                  onChange={(e) => setLyricsText(e.target.value)}
                  placeholder="Paste song lyrics here"
                  className="bg-black/50 border-purple-500/30 focus:border-purple-500 resize-none h-32"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                clearForm()
              }}
              disabled={isLoading}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
              disabled={isLoading || !songFile || !songTitle || !artist}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Song"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Component for deleting user-uploaded songs
export function UserSongManager() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userTracks, setUserTracks] = useState<Track[]>([])
  
  // Load user tracks from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTracks = localStorage.getItem('userTracks')
      if (storedTracks) {
        try {
          setUserTracks(JSON.parse(storedTracks))
        } catch (error) {
          console.error("Error parsing user tracks:", error)
          setUserTracks([])
        }
      }
    }
  }, [open])
  
  const deleteTrack = (trackId: string) => {
    setIsLoading(true)
    
    try {
      // Remove from localStorage
      const updatedTracks = userTracks.filter(track => track.id !== trackId)
      localStorage.setItem('userTracks', JSON.stringify(updatedTracks))
      setUserTracks(updatedTracks)
      
      // Remove from IndexedDB
      if (window.indexedDB) {
        const request = window.indexedDB.open("VibeFlowUserMedia", 1)
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          const transaction = db.transaction(["songs", "covers", "lyrics"], "readwrite")
          
          transaction.objectStore("songs").delete(trackId)
          transaction.objectStore("covers").delete(trackId)
          transaction.objectStore("lyrics").delete(trackId)
          
          transaction.oncomplete = () => {
            setIsLoading(false)
            
            toast({
              title: "Song Deleted",
              description: "The song has been removed from your library",
            })
          }
        }
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error deleting track:", error)
      setIsLoading(false)
      
      toast({
        title: "Delete Failed",
        description: "There was a problem removing the song",
        variant: "destructive"
      })
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 w-full mt-2 border-dashed border-red-500/50 hover:bg-red-500/10"
        >
          <X size={16} />
          Manage Uploaded Songs
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/90 backdrop-blur-lg border border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Manage Your Songs</DialogTitle>
          <DialogDescription>
            View and delete songs you've uploaded
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-80 overflow-y-auto">
          {userTracks.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-12 w-12 mx-auto mb-2 text-gray-500" />
              <p className="text-gray-400">You haven't uploaded any songs yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {userTracks.map((track) => (
                <div key={track.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                  <div className="flex items-center">
                    <div className="relative h-10 w-10 mr-3 bg-purple-500/20 rounded overflow-hidden">
                      {track.coverArt && !track.coverArt.includes('default-cover') ? (
                        <Image 
                          src={track.coverArt} 
                          alt={track.title}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <Music className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium truncate">{track.title}</p>
                      <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => deleteTrack(track.id)}
                    disabled={isLoading}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 