"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useLibrary } from "@/context/library-context"
import { useMusic } from "@/context/music-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Music, ListMusic, PlusCircle, User, Clock } from "lucide-react"
import PlaylistCreator from "@/components/library/playlist-creator"
import SongUploader, { UserSongManager } from "@/components/library/song-uploader"
import Image from "next/image"
import { motion } from "framer-motion"
import SongCard from "@/components/song-card"
import { useToast } from "@/hooks/use-toast"

export default function LibraryPage() {
  const { user, isAuthenticated } = useAuth()
  const { playlists, likedSongs } = useLibrary()
  const { queue, playTrack } = useMusic()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("liked")
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // If not authenticated, redirect to auth page
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your library",
        variant: "destructive"
      })
      router.push("/auth")
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, router, toast])
  
  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="container px-4 py-8 pb-24">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 mb-4 border border-purple-500/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 bg-purple-500/20 rounded-full flex items-center justify-center">
                <User className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{user?.displayName || "Music Lover"}</h2>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{likedSongs.length}</p>
                <p className="text-xs text-gray-400">Liked Songs</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{playlists.length}</p>
                <p className="text-xs text-gray-400">Playlists</p>
              </div>
            </div>
          </div>
          
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ListMusic className="h-5 w-5 text-purple-400" />
              Your Library
            </h3>
            
            <div className="space-y-2 mb-4">
              <button 
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'liked' ? 'bg-purple-500/20 text-white' : 'hover:bg-purple-500/10 text-gray-300'}`}
                onClick={() => setActiveTab('liked')}
              >
                <Heart className={`h-4 w-4 ${activeTab === 'liked' ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                Liked Songs
              </button>
              
              {playlists.map(playlist => (
                <button
                  key={playlist.id}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${activeTab === playlist.id ? 'bg-purple-500/20 text-white' : 'hover:bg-purple-500/10 text-gray-300'}`}
                  onClick={() => setActiveTab(playlist.id)}
                >
                  <Music className={`h-4 w-4 ${activeTab === playlist.id ? 'text-purple-400' : 'text-gray-400'}`} />
                  <span className="truncate">{playlist.name}</span>
                  <span className="ml-auto text-xs text-gray-500">{playlist.tracks.length}</span>
                </button>
              ))}
            </div>
            
            <PlaylistCreator />
            
            {isAuthenticated && (
              <>
                <SongUploader />
                <UserSongManager />
              </>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-2/3 lg:w-3/4">
          {activeTab === 'liked' ? (
            <div>
              <div className="flex items-end gap-6 mb-8">
                <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-red-500/20 to-red-500/40">
                  <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 text-red-500 fill-red-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Playlist</p>
                  <h1 className="text-4xl font-bold mb-2">Liked Songs</h1>
                  <p className="text-gray-400 text-sm">{likedSongs.length} songs</p>
                </div>
              </div>
              
              {likedSongs.length === 0 ? (
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 text-center">
                  <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Liked Songs Yet</h3>
                  <p className="text-gray-400 mb-4">Start liking songs to see them here</p>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push("/discover")}
                    className="border-purple-500/30 hover:bg-purple-500/10"
                  >
                    Discover Music
                  </Button>
                </div>
              ) : (
                <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800 flex items-center text-gray-400 text-sm">
                    <div className="w-10 text-center">#</div>
                    <div className="flex-1 ml-2">Title</div>
                    <div className="w-1/4 hidden md:block">Album</div>
                    <div className="w-32 text-right flex items-center justify-end">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-800/50">
                    {likedSongs.map((song, index) => (
                      <motion.div 
                        key={song.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="px-6 py-3 flex items-center hover:bg-white/5 group"
                      >
                        <div className="w-10 text-center text-gray-500">{index + 1}</div>
                        <div className="flex-1 ml-2 flex items-center">
                          <div className="relative w-10 h-10 mr-3">
                            <Image 
                              src={song.coverArt} 
                              alt={song.title}
                              width={40}
                              height={40}
                              className="object-cover rounded-sm"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <button 
                                className="text-white" 
                                onClick={() => {
                                  const songIndex = queue.findIndex(track => track.id === song.id);
                                  if (songIndex !== -1) {
                                    playTrack(songIndex);
                                  }
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium truncate">{song.title}</p>
                            <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                          </div>
                        </div>
                        <div className="w-1/4 hidden md:block text-gray-400 text-sm truncate">{song.album}</div>
                        <div className="w-32 text-right text-gray-400 text-sm">
                          {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <PlaylistView playlistId={activeTab} />
          )}
        </div>
      </div>
    </div>
  )
}

function PlaylistView({ playlistId }: { playlistId: string }) {
  const { getPlaylist } = useLibrary()
  const { queue, playTrack } = useMusic()
  const playlist = getPlaylist(playlistId)
  
  if (!playlist) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 text-center">
        <h3 className="text-xl font-bold mb-2">Playlist Not Found</h3>
        <p className="text-gray-400">The playlist you're looking for could not be found</p>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex items-end gap-6 mb-8">
        <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-purple-500/20 to-blue-500/40">
          {playlist.coverImage ? (
            <Image 
              src={playlist.coverImage} 
              alt={playlist.name}
              fill
              className="object-cover"
            />
          ) : (
            <Music className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 text-purple-400" />
          )}
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">Playlist</p>
          <h1 className="text-4xl font-bold mb-2">{playlist.name}</h1>
          <p className="text-gray-400 text-sm mb-1">{playlist.description}</p>
          <p className="text-gray-400 text-sm">{playlist.tracks.length} songs</p>
        </div>
      </div>
      
      {playlist.tracks.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 text-center">
          <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Songs Yet</h3>
          <p className="text-gray-400 mb-4">Add songs to this playlist to see them here</p>
          <Button 
            variant="outline" 
            className="border-purple-500/30 hover:bg-purple-500/10"
            onClick={() => {}}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Songs
          </Button>
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center text-gray-400 text-sm">
            <div className="w-10 text-center">#</div>
            <div className="flex-1 ml-2">Title</div>
            <div className="w-1/4 hidden md:block">Album</div>
            <div className="w-32 text-right flex items-center justify-end">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          
          <div className="divide-y divide-gray-800/50">
            {playlist.tracks.map((song, index) => (
              <motion.div 
                key={song.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="px-6 py-3 flex items-center hover:bg-white/5 group"
              >
                <div className="w-10 text-center text-gray-500">{index + 1}</div>
                <div className="flex-1 ml-2 flex items-center">
                  <div className="relative w-10 h-10 mr-3">
                    <Image 
                      src={song.coverArt} 
                      alt={song.title}
                      width={40}
                      height={40}
                      className="object-cover rounded-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button 
                        className="text-white" 
                        onClick={() => {
                          const songIndex = queue.findIndex(track => track.id === song.id);
                          if (songIndex !== -1) {
                            playTrack(songIndex);
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium truncate">{song.title}</p>
                    <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                  </div>
                </div>
                <div className="w-1/4 hidden md:block text-gray-400 text-sm truncate">{song.album}</div>
                <div className="w-32 text-right text-gray-400 text-sm">
                  {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
