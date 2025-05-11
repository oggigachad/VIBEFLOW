"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useMusic } from "@/context/music-context"
import { useRouter, usePathname } from "next/navigation"
import { Heart, SkipBack, Play, Pause, SkipForward, Repeat, Repeat1, Volume2, VolumeX, Shuffle, Music, ListMusic, Maximize2, Minimize2, MinusSquare, ChevronUp, ChevronDown, Download } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { formatTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import MiniPlayer from "./mini-player"
import AudioVisualizer from "./audio-visualizer"
import LyricsDisplay from "./lyrics-display"
import QueueManager from "./queue-manager"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useSidebar } from "@/contexts/sidebar-context"

export default function RootMusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isShuffleEnabled,
    isRepeatEnabled,
    likedTracks,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    isLiked,
    toggleLikeSong
  } = useMusic()
  
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { collapsed } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  
  // Check if we're on an auth page
  const isAuthPage = pathname?.startsWith('/auth')
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null)
  const animationRef = useRef<number | null>(null)
  const visualizerRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  
  // Local state
  const [expanded, setExpanded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [minimized, setMinimized] = useState(false)
  const [normal, setNormal] = useState(true) // For the third state (normal size)
  const [showLyrics, setShowLyrics] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [heartAnimation, setHeartAnimation] = useState(false)
  
  // Initialize Web Audio API
  useEffect(() => {
    if (isAuthPage) return;
    
    if (!audioRef.current) return;
    
    // Audio context will be created and managed by the AudioVisualizer component
    
    return undefined;
  }, [isAuthPage]);
  
  // Add event listeners to the audio element for better sync
  useEffect(() => {
    if (!audioRef.current || isAuthPage) return;
    
    // Update progress based on timeupdate event
    const handleTimeUpdate = () => {
      if (!audioRef.current || !duration) return;
      const currentTime = audioRef.current.currentTime;
      const progressPercent = (currentTime / audioRef.current.duration) * 100;
      setCurrentTime(currentTime);
      // Only update context progress if significantly different to avoid loops
      if (Math.abs(progressPercent - progress) > 0.5) {
        seekTo(currentTime);
      }
    };
    
    // Handle audio duration loaded
    const handleDurationChange = () => {
      if (!audioRef.current) return;
      const audioDuration = audioRef.current.duration;
      // Only update if significantly different
      if (Math.abs(audioDuration - duration) > 0.5) {
        seekTo(0); // Reset progress when duration changes
      }
    };
    
    // Handle track ending
    const handleEnded = () => {
      if (isRepeatEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          console.error("Error replaying audio:", err);
        });
      } else {
        nextTrack();
      }
    };
    
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('durationchange', handleDurationChange);
    audioRef.current.addEventListener('ended', handleEnded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('durationchange', handleDurationChange);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [duration, progress, isRepeatEnabled, nextTrack, seekTo, isAuthPage]);
  
  // Update playback state when isPlaying changes
  useEffect(() => {
    if (!audioRef.current || isAuthPage) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        // If auto-play fails, update UI state to reflect actual state
        togglePlayPause();
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, togglePlayPause, isAuthPage]);
  
  // Update current time based on progress
  useEffect(() => {
    if (duration && !isAuthPage) {
      setCurrentTime((progress / 100) * duration)
    }
  }, [progress, duration, isAuthPage])
  
  // Apply volume to audio element
  useEffect(() => {
    if (audioRef.current && !isAuthPage) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted, isAuthPage])
  
  // Handle audio src changes
  useEffect(() => {
    if (currentTrack && audioRef.current && !isAuthPage) {
      audioRef.current.src = currentTrack.audioUrl
      
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err)
        })
      }
    }
  }, [currentTrack, isPlaying, isAuthPage])
  
  // Toggle between main player and mini player
  const toggleMinimized = () => {
    // Store current playback state before changing views
    const wasPlaying = isPlaying;
    const currentPlaybackTime = audioRef.current?.currentTime || 0;
    
    setMinimized(!minimized)
    setNormal(true)
    setExpanded(false)
    setShowLyrics(false)
    setShowQueue(false)
    
    // Continue playback without interruption
    setTimeout(() => {
      if (audioRef.current && currentTrack) {
        if (wasPlaying) {
          audioRef.current.play().catch(err => {
            console.error("Error resuming audio after view switch:", err);
          });
        }
      }
    }, 100);
  }
  
  // Set to normal size (between mini and expanded)
  const toggleNormal = () => {
    // Store current playback state and time
    const wasPlaying = isPlaying;
    const currentPlaybackTime = audioRef.current?.currentTime || 0;
    
    setMinimized(false)
    setNormal(true)
    setExpanded(false)
    setShowLyrics(false)
    setShowQueue(false)
    
    // Continue playback without interruption
    setTimeout(() => {
      if (currentTrack && audioRef.current) {
        audioRef.current.currentTime = currentPlaybackTime;
        
        if (wasPlaying) {
          audioRef.current.play().catch(err => {
            console.error("Error resuming audio after view switch:", err);
          });
        }
      }
    }, 100);
  }
  
  // Toggle expanded view (full screen)
  const toggleExpanded = () => {
    // Store current playback state and time
    const wasPlaying = isPlaying;
    const currentPlaybackTime = audioRef.current?.currentTime || 0;
    
    // Toggle expanded state
    setExpanded(!expanded);
    setNormal(false);
    setMinimized(false);
    
    // Also close any panels if we're already expanded and toggling again
    if (expanded) {
      setShowLyrics(false);
      setShowQueue(false);
    }
    
    // Apply full-screen style when expanded
    if (!expanded) {
      // Target the main container to style it as full window
      const mainContainer = document.querySelector('.main-player-container');
      if (mainContainer) {
        mainContainer.classList.add('full-window-player');
      }
      
      // Hide scrollbars on body when in full screen
      document.body.style.overflow = 'hidden';
    } else {
      // Remove full-window styling
      const mainContainer = document.querySelector('.main-player-container');
      if (mainContainer) {
        mainContainer.classList.remove('full-window-player');
      }
      
      // Restore scrolling
      document.body.style.overflow = '';
    }
    
    // Ensure playback continues without interruption
    setTimeout(() => {
      if (audioRef.current && currentTrack) {
        audioRef.current.currentTime = currentPlaybackTime;
        
        if (wasPlaying) {
          audioRef.current.play().catch(err => {
            console.error("Error resuming audio after view switch:", err);
          });
        }
      }
    }, 100);
  }
  
  // Handle heart animation
  const handleLikeClick = () => {
    if (!currentTrack) return
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like songs",
        variant: "destructive"
      })
      router.push("/auth/login")
      return
    }
    
    const newLikeStatus = toggleLikeSong(currentTrack)
    if (newLikeStatus) {
      setHeartAnimation(true)
      setTimeout(() => setHeartAnimation(false), 1000)
      
      toast({
        title: "Added to Liked Songs",
        description: `"${currentTrack.title}" has been added to your library`,
        variant: "default"
      })
    } else {
      toast({
        title: "Removed from Liked Songs",
        description: `"${currentTrack.title}" has been removed from your library`,
        variant: "default"
      })
    }
  }
  
  // Handle download functionality
  const handleDownload = () => {
    if (!currentTrack) return
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to download songs",
        variant: "destructive"
      })
      router.push("/auth/login")
      return
    }
    
    try {
      // Create an anchor element
      const anchor = document.createElement('a')
      anchor.href = currentTrack.audioUrl
      anchor.download = `${currentTrack.artist} - ${currentTrack.title}.mp3`
      
      // Append to document, trigger click, and remove
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      
      toast({
        title: "Download Started",
        description: `Downloading "${currentTrack.title}" by ${currentTrack.artist}`,
        variant: "default"
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Failed",
        description: "There was an error downloading the track",
        variant: "destructive"
      })
    }
  }
  
  // Handle seek bar interaction
  const handleSeek = (value: number[]) => {
    if (!audioRef.current || !duration) return;
    
    const newTime = (value[0] / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    seekTo(newTime);
  };

  // Skip forward 10 seconds
  const skipForward = () => {
    if (!audioRef.current || !duration) return;
    
    const newTime = Math.min(audioRef.current.currentTime + 10, duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    seekTo(newTime);
  };
  
  // Skip backward 10 seconds
  const skipBackward = () => {
    if (!audioRef.current || !duration) return;
    
    const newTime = Math.max(audioRef.current.currentTime - 10, 0);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    seekTo(newTime);
  };
  
  // Replace the early return with conditional rendering
  if (isAuthPage) {
    return null;
  }
  
  // No current track means no player
  if (!currentTrack) {
    return null;
  }
  
  // Show mini player if minimized
  if (minimized) {
    return <MiniPlayer onExpand={toggleNormal} />;
  }
  
  return (
    <>
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-10 transition-all duration-500 main-player-container",
        expanded ? "h-[calc(100vh-4rem)]" : "h-24",
        showLyrics || showQueue ? "h-[calc(100vh-4rem)]" : ""
      )}>
        {/* Audio element (hidden) */}
        <audio ref={audioRef} preload="auto" />
        
        {/* Background with glassmorphism effect */}
        <div className="absolute inset-0 backdrop-blur-lg bg-background/80 border-t border-border shadow-lg" />
        
        <div className={cn(
          "relative h-full mx-auto px-4 flex flex-col player-content transition-all duration-300",
          collapsed ? "ml-0 max-w-screen-2xl" : "ml-0 md:ml-64 max-w-[calc(100vw-1rem)]"
        )}>
          {/* Expand/Collapse Button */}
          <button 
            onClick={() => {
              setExpanded(!expanded)
              setShowLyrics(false)
              setShowQueue(false)
            }}
            className="absolute top-2 left-1/2 transform -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
          
          {/* Main Player Controls Row */}
          <div className="h-24 flex items-center justify-between space-x-4">
            {/* Track Info */}
            <div className="flex items-center space-x-4 w-1/4 min-w-[220px]">
              <div className="relative w-14 h-14 rounded-md overflow-hidden shadow-md">
                <motion.div 
                  animate={{ 
                    rotate: isPlaying ? 360 : 0 
                  }}
                  transition={{ 
                    duration: 20, 
                    ease: "linear", 
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                  className={cn(
                    "w-full h-full rounded-full overflow-hidden",
                    isPlaying ? "" : "transition-all duration-500"
                  )}
                >
                  <Image 
                    src={currentTrack.coverArt} 
                    alt={currentTrack.title}
                    className="object-cover" 
                    fill
                  />
                </motion.div>
              </div>
              <div className="truncate">
                <h3 className="text-sm font-medium truncate">{currentTrack.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
            </div>
            
            {/* Primary Controls */}
            <div className="flex flex-col items-center justify-center space-y-2 w-2/4">
              {/* Playback Controls */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleShuffle}
                  className={cn(
                    "text-muted-foreground hover:text-foreground transition-colors",
                    isShuffleEnabled && "text-primary"
                  )}
                  title="Shuffle"
                >
                  <Shuffle size={18} />
                </Button>
                
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    // Enhanced previous track handling
                    if (audioRef.current && audioRef.current.currentTime > 3) {
                      // If more than 3 seconds into song, restart it
                      audioRef.current.currentTime = 0;
                      setCurrentTime(0);
                      seekTo(0);
                    } else {
                      // Otherwise go to previous track
                      previousTrack();
                    }
                  }}
                  className="text-foreground hover:text-primary transition-colors"
                  title="Previous"
                >
                  <SkipBack size={22} />
                </Button>
                
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => {
                    // Toggle play/pause and make sure audio element state matches
                    togglePlayPause();
                    if (audioRef.current) {
                      if (!isPlaying) {
                        audioRef.current.play().catch(err => {
                          console.error("Error playing audio:", err);
                        });
                      } else {
                        audioRef.current.pause();
                      }
                    }
                  }}
                  className="rounded-full bg-primary hover:bg-primary/90 transition-colors h-10 w-10"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
                </Button>
                
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    // Enhanced next track
                    nextTrack();
                    // Ensure audio starts playing
                    if (audioRef.current && !isPlaying) {
                      setTimeout(() => {
                        audioRef.current?.play().catch(err => {
                          console.error("Error playing next track:", err);
                        });
                      }, 50);
                    }
                  }}
                  className="text-foreground hover:text-primary transition-colors"
                  title="Next"
                >
                  <SkipForward size={22} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    toggleRepeat();
                    // Audio element no longer needs loop property as we handle it in the ended event
                  }}
                  className={cn(
                    "text-muted-foreground hover:text-foreground transition-colors",
                    isRepeatEnabled && "text-primary"
                  )}
                  title="Repeat"
                >
                  {isRepeatEnabled ? <Repeat1 size={18} /> : <Repeat size={18} />}
                </Button>
              </div>
              
              {/* Seek Bar */}
              <div className="flex items-center w-full space-x-2">
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                
                <Slider
                  value={[progress]}
                  max={100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full cursor-pointer"
                />
                
                <span className="text-xs text-muted-foreground w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
            
            {/* Right Controls */}
            <div className="flex items-center justify-end space-x-3 w-1/4">
              {/* Like Button with Animation */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLikeClick}
                  className={cn(
                    "text-muted-foreground hover:text-foreground transition-colors",
                    isLiked(currentTrack.id) && "text-red-500"
                  )}
                  title="Like"
                >
                  <Heart size={18} fill={isLiked(currentTrack.id) ? "currentColor" : "none"} />
                </Button>
                
                {/* Heart burst animation */}
                <AnimatePresence>
                  {heartAnimation && (
                    <motion.div 
                      className="absolute -top-1 -left-1 right-0 bottom-0 pointer-events-none"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      exit={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Heart size={30} className="text-red-500" fill="currentColor" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Download Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Download"
              >
                <Download size={18} />
              </Button>
              
              {/* Queue Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowQueue(!showQueue)
                  setShowLyrics(false)
                  setExpanded(false)
                }}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors",
                  showQueue && "text-primary"
                )}
                title="Queue"
              >
                <ListMusic size={18} />
              </Button>
              
              {/* Lyrics Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowLyrics(!showLyrics)
                  setShowQueue(false)
                  setExpanded(false)
                }}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors",
                  showLyrics && "text-primary"
                )}
                title="Lyrics"
              >
                <Music size={18} />
              </Button>
              
              {/* Volume Control */}
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </Button>
                
                <div className="w-24 hidden md:block">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    onValueChange={(value) => setVolume(value[0])}
                    className="cursor-pointer"
                  />
                </div>
              </div>
              
              {/* Size Toggle Buttons */}
              <div className="flex items-center space-x-1">
                {/* Normal Size */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleNormal}
                  className={cn(
                    "text-muted-foreground hover:text-foreground transition-colors",
                    normal && !expanded && "text-primary"
                  )}
                  title="Normal"
                >
                  <MinusSquare size={16} />
                </Button>
                
                {/* Maximize */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleExpanded}
                  className={cn(
                    "text-muted-foreground hover:text-foreground transition-colors",
                    expanded && "text-primary"
                  )}
                  title="Maximize"
                >
                  <Maximize2 size={16} />
                </Button>
                
                {/* Minimize */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMinimized}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Minimize"
                >
                  <Minimize2 size={16} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Expanded Content - Shown when expanded, showLyrics, or showQueue is true */}
          <AnimatePresence>
            {(expanded || showLyrics || showQueue) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-hidden"
              >
                <div className="h-full py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Album Art and Visualizer */}
                  <div className="flex flex-col justify-center items-center space-y-6">
                    {/* Animated Album Art - Fixed beat effect issue */}
                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center album-art-container">
                      <motion.div 
                        animate={{ 
                          rotate: isPlaying ? 360 : 0 
                        }}
                        transition={{ 
                          duration: 20, 
                          ease: "linear", 
                          repeat: Infinity 
                        }}
                        className="w-full h-full rounded-full overflow-hidden shadow-xl relative"
                      >
                        <Image 
                          src={currentTrack.coverArt} 
                          alt={currentTrack.title}
                          className="object-cover" 
                          fill
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-full" />
                      </motion.div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/80 z-10" />
                    </div>
                    
                    {/* Audio Visualizer */}
                    <div className="w-full max-w-md h-32 bg-black/20 rounded-lg overflow-hidden visualizer-container">
                      <AudioVisualizer 
                        audioRef={audioRef}
                        className="w-full h-full"
                      />
                    </div>
                    
                    {/* Track Info for Expanded View */}
                    <div className="text-center">
                      <h2 className="text-2xl font-bold">{currentTrack.title}</h2>
                      <p className="text-muted-foreground">{currentTrack.artist}</p>
                      <p className="text-sm text-muted-foreground">{currentTrack.album}</p>
                      
                      {/* Download button in expanded view */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDownload}
                        className="mt-4 flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  {/* Right Panel - Lyrics or Queue */}
                  <div className="relative h-full overflow-hidden">
                    {showLyrics && <LyricsDisplay trackId={currentTrack.id} currentTime={currentTime} />}
                    {showQueue && <QueueManager />}
                    {(!showLyrics && !showQueue) && (
                      <div className="flex flex-col items-center justify-center h-full space-y-8">
                        <p className="text-xl text-muted-foreground italic">Now Playing</p>
                        <div className="flex gap-4 flex-wrap justify-center">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowQueue(true)}
                            className="flex items-center gap-2"
                          >
                            <ListMusic size={16} />
                            View Queue
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowLyrics(true)}
                            className="flex items-center gap-2"
                          >
                            <Music size={16} />
                            Show Lyrics
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={handleDownload}
                            className="flex items-center gap-2"
                          >
                            <Download size={16} />
                            Download Song
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
} 