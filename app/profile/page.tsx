"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/context/auth-context"
import { useUserStats } from "@/context/user-stats-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, User, LogOut, Clock, Music, Disc, BarChart3, Play } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useSplash } from "@/components/splash/use-splash"
import { useMusic } from "@/context/music-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import Image from "next/image"

const profileSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters" }).optional(),
  photoURL: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { userProfile, updateUserProfile, logout } = useAuth()
  const { userStats, recentlyPlayed, isLoading: statsLoading, refreshStats } = useUserStats()
  const { playTrack, queue } = useMusic()
  const [isLoading, setIsLoading] = useState(false)
  const { triggerSplash } = useSplash()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: userProfile?.displayName || "",
      photoURL: userProfile?.photoURL || "",
    },
  })
  
  // Format time function (converts seconds to hours:minutes:seconds)
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else {
      return `${minutes}m ${remainingSeconds}s`
    }
  }

  // Format date function
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsLoading(true)
      triggerSplash({ x: window.innerWidth / 2, y: window.innerHeight / 2, color: "rgba(168, 85, 247, 0.4)" })
      await updateUserProfile({
        displayName: data.displayName || userProfile?.displayName,
        photoURL: data.photoURL || userProfile?.photoURL,
      })
    toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
    })
    } catch (error: any) {
      console.error("Profile update error:", error)
    toast({
        title: "Error",
        description: error.message || "Failed to update profile",
      variant: "destructive",
    })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      triggerSplash({ x: window.innerWidth / 2, y: window.innerHeight / 2, color: "rgba(239, 68, 68, 0.4)" })
    } catch (error: any) {
      console.error("Logout error:", error)
    toast({
        title: "Error",
        description: error.message || "Failed to log out",
        variant: "destructive",
    })
    }
  }

  const handleRefreshStats = async () => {
    try {
      await refreshStats()
      toast({
        title: "Stats refreshed",
        description: "Your listening stats have been updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to refresh stats",
        variant: "destructive",
      })
    }
  }

  // Add a function to play a song
  const handlePlaySong = (trackId: string) => {
    try {
      // Find the index of the song in the queue by id
      const trackIndex = queue.findIndex(track => track.id === trackId);
      
      if (trackIndex !== -1) {
        // If found in queue, play directly
        playTrack(trackIndex);
      } else {
        // Track not in queue - look through recently played or stats
        const trackFromHistory = recentlyPlayed.find(t => t.songId === trackId);
        const trackFromMostPlayed = userStats?.mostPlayed?.find(t => t.songId === trackId);
        
        if (trackFromHistory || trackFromMostPlayed) {
          // Get track info from either source
          const trackInfo = trackFromHistory || trackFromMostPlayed;
          const trackTitle = trackInfo?.title || '';
          const trackArtist = trackInfo?.artist || '';
          
          // Try to find a similar track in the current queue
          const similarTrack = queue.find(t => 
            t.title.toLowerCase() === trackTitle.toLowerCase() || 
            t.artist.toLowerCase() === trackArtist.toLowerCase()
          );
          
          if (similarTrack) {
            const similarIndex = queue.findIndex(t => t.id === similarTrack.id);
            playTrack(similarIndex);
          } else {
            // If nothing matches, default to the first track
            playTrack(0);
            toast({
              title: "Track not available",
              description: `"${trackTitle}" isn't currently in the queue`,
              duration: 3000,
            });
          }
        } else {
          // If no track info, just play the first track
          playTrack(0);
        }
      }
    } catch (error) {
      console.error("Error playing song:", error);
      toast({
        title: "Playback Error",
        description: "Failed to play the selected track",
        variant: "destructive"
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="container max-w-4xl py-10 pb-24">
        <Toaster />
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-purple-500">
                <AvatarImage src={userProfile?.photoURL || ""} alt={userProfile?.displayName || "User"} />
                <AvatarFallback className="bg-purple-800 text-xl">
                  {userProfile?.displayName?.charAt(0) || <User className="h-8 w-8" />}
                </AvatarFallback>
                </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{userProfile?.displayName || "User Profile"}</h1>
                <p className="text-gray-400">{userProfile?.email}</p>
              </div>
              </div>
            <Button variant="destructive" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
              </Button>
          </div>

          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="w-full bg-black/30 backdrop-blur-md border border-purple-500/20 mb-6">
              <TabsTrigger value="stats" className="flex gap-2 items-center">
                <BarChart3 className="h-4 w-4" />
                Listening Stats
              </TabsTrigger>
              <TabsTrigger value="history" className="flex gap-2 items-center">
                <Clock className="h-4 w-4" />
                Recently Played
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex gap-2 items-center">
                <User className="h-4 w-4" />
                Profile Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stats Overview Card */}
                <Card className="bg-black/40 border-purple-500/20">
            <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-400" />
                      Listening Overview
                    </CardTitle>
                    <CardDescription>Your music listening statistics</CardDescription>
            </CardHeader>
            <CardContent>
                    {statsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/30 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Total Listening Time</p>
                            <p className="text-2xl font-bold mt-1">
                              {userStats ? formatTime(userStats.totalListeningTime) : "0m 0s"}
                            </p>
                  </div>
                          <div className="bg-black/30 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Songs Played</p>
                            <p className="text-2xl font-bold mt-1">
                              {userStats?.songsPlayed || 0}
                            </p>
                    </div>
                  </div>
                  
                        <div>
                          <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                            <Music className="h-4 w-4 text-purple-400" />
                            Top Artists
                          </h3>
                          <div className="space-y-2">
                            {userStats?.topArtists && userStats.topArtists.length > 0 ? (
                              userStats.topArtists.map((artist, index) => (
                                <div key={index} className="flex justify-between items-center bg-black/20 p-2 rounded">
                                  <span>{artist.name}</span>
                                  <span className="text-sm bg-purple-900/40 px-2 py-1 rounded">
                                    {artist.count} {artist.count === 1 ? 'play' : 'plays'}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-sm">No data yet</p>
                            )}
                    </div>
                  </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                            <Disc className="h-4 w-4 text-purple-400" />
                            Top Genres
                          </h3>
                  <div className="space-y-2">
                            {userStats?.topGenres && userStats.topGenres.length > 0 ? (
                              userStats.topGenres.map((genre, index) => (
                                <div key={index} className="flex justify-between items-center bg-black/20 p-2 rounded">
                                  <span className="capitalize">{genre.name}</span>
                                  <span className="text-sm bg-purple-900/40 px-2 py-1 rounded">
                                    {genre.count} {genre.count === 1 ? 'play' : 'plays'}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-sm">No data yet</p>
                            )}
                    </div>
                  </div>
                  
                        <Button onClick={handleRefreshStats} variant="outline" className="w-full">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Refresh Stats
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Most Played Songs Card */}
                <Card className="bg-black/40 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music className="h-5 w-5 text-purple-400" />
                      Most Played Songs
                    </CardTitle>
                    <CardDescription>Your most frequently played tracks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userStats?.mostPlayed && userStats.mostPlayed.length > 0 ? (
                          userStats.mostPlayed.slice(0, 5).map((song, index) => (
                            <motion.div 
                              key={song.songId}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-3 bg-black/20 p-2 rounded group hover:bg-purple-900/20 transition-colors"
                              onClick={() => handlePlaySong(song.songId)}
                            >
                              <div className="w-8 h-8 flex items-center justify-center">
                                <span className="text-gray-400 group-hover:hidden">{index + 1}</span>
                                <Play className="h-4 w-4 hidden group-hover:block text-purple-400" />
                              </div>
                              <div className="h-10 w-10 relative rounded overflow-hidden">
                                <Image 
                                  src={song.coverUrl} 
                                  alt={song.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{song.title}</p>
                                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                    </div>
                              <div className="text-sm bg-purple-900/40 px-2 py-1 rounded whitespace-nowrap">
                                {song.playCount} {song.playCount === 1 ? 'play' : 'plays'}
                  </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Music className="h-12 w-12 mx-auto text-gray-600 mb-2" />
                            <p className="text-gray-400">No listening data yet</p>
                            <p className="text-sm text-gray-500">Play some songs to see your stats</p>
                  </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                      </div>
            </TabsContent>
            
            <TabsContent value="history">
              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-400" />
                    Recently Played
                  </CardTitle>
                  <CardDescription>Your listening history</CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentlyPlayed && recentlyPlayed.length > 0 ? (
                        recentlyPlayed.map((item, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-3 bg-black/20 p-2 rounded group hover:bg-purple-900/20 transition-colors"
                            onClick={() => handlePlaySong(item.songId)}
                          >
                            <div className="h-12 w-12 relative rounded overflow-hidden">
                            <Image 
                                src={item.coverUrl} 
                                alt={item.title}
                              fill
                                className="object-cover"
                            />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Play className="h-6 w-6 text-white" />
                              </div>
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.title}</p>
                              <p className="text-sm text-gray-400 truncate">{item.artist}</p>
                          </div>
                            <div className="text-sm text-gray-400">
                              {formatDate(item.timestamp)}
                          </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 mx-auto text-gray-600 mb-2" />
                          <p className="text-gray-400">No listening history yet</p>
                          <p className="text-sm text-gray-500">Play some songs to see your history</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="profile">
              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} className="bg-black/40" />
                            </FormControl>
                            <FormDescription>This is your public display name.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="photoURL"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Picture URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/avatar.jpg" {...field} className="bg-black/40" />
                            </FormControl>
                            <FormDescription>Enter a URL for your profile picture.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isLoading ? "Saving..." : "Save changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-purple-500/20 mt-6">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Account ID</p>
                        <p className="text-sm mt-1 font-mono bg-black/30 p-2 rounded">{userProfile?.uid}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Provider</p>
                        <p className="text-sm mt-1 capitalize">{userProfile?.providerId.replace(".com", "")}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Created</p>
                        <p className="text-sm mt-1">{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Last Login</p>
                        <p className="text-sm mt-1">{userProfile?.lastLoginAt ? new Date(userProfile.lastLoginAt).toLocaleDateString() : "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                </TabsContent>
              </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
