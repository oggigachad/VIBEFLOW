"use client"

import { useState, useEffect, useRef } from "react"
import { useMusic } from "@/hooks/use-music"
import { usePreferences } from "@/hooks/use-preferences"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle, 
  Download, 
  Heart, 
  HeartOff,
  ListMusic,
  Mic,
  Settings
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { formatTime } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

export interface MusicPlayerProps {
  variant?: "expanded" | "mini"
  onToggleExpand?: () => void
  className?: string
}

export default function MusicPlayer({ 
  variant = "expanded", 
  onToggleExpand,
  className = ""
}: MusicPlayerProps) {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause, 
    nextTrack, 
    previousTrack,
    setProgress,
    progress,
    duration,
    toggleRepeat,
    toggleShuffle,
    isRepeatEnabled,
    isShuffleEnabled,
    isLiked,
    toggleLikeSong,
    downloadTrack,
    setDuration
  } = useMusic()
  
  const { preferences, updatePreferences } = usePreferences()
  const [volume, setVolume] = useState(preferences.volume)
  const [isMuted, setIsMuted] = useState(preferences.isMuted)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Add global error handler for audio
      audioRef.current.onerror = (e) => {
        console.error("Audio error:", e);
        toast({
          title: "Audio Error",
          description: "Failed to load or play the audio file",
          variant: "destructive"
        });
      };
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    }
  }, []);
  
  // Update audio source when track changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      try {
        // Set the source
        audioRef.current.src = currentTrack.audioUrl;
        
        // Add better error handling for file not found or decode errors
        const handleLoadError = (event: Event | string) => {
          console.error("Audio load error:", event);
          
          // Check if it's likely a file not found error
          toast({
            title: "Track Unavailable",
            description: `Could not load "${currentTrack.title}". The file may be missing or corrupted.`,
            variant: "destructive"
          });
          
          // Attempt to play the next track if this one fails
          setTimeout(() => {
            nextTrack();
          }, 1500);
        };
        
        audioRef.current.onerror = handleLoadError;
        audioRef.current.load();
        
        // Play the audio if isPlaying is true
        if (isPlaying) {
          // Using a promise to catch any autoplay restrictions
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Playback started successfully
                console.log("Playback started successfully");
              })
              .catch(error => {
                // Auto-play was prevented
                console.error("Audio playback failed:", error);
                // Notify user of autoplay restriction
                toast({
                  title: "Playback Error",
                  description: "Please interact with the page to enable audio playback",
                  variant: "default"
                });
              });
          }
        }
        
        // Set up event listeners for audio
        audioRef.current.onended = () => {
          if (isRepeatEnabled) {
            setProgress(0);
            audioRef.current!.currentTime = 0;
            audioRef.current!.play().catch(err => {
              console.error("Replay error:", err);
              toast({
                title: "Playback Error",
                description: "Failed to replay track. Trying next track.",
                variant: "destructive"
              });
              nextTrack();
            });
          } else {
            nextTrack();
          }
        };
        
        // Update audio duration when loaded
        audioRef.current.onloadedmetadata = () => {
          setDuration(audioRef.current!.duration);
        };
        
        // Handle audio stalling
        audioRef.current.onstalled = () => {
          toast({
            title: "Playback Issue",
            description: "Audio stream stalled. Trying to recover...",
            variant: "default"
          });
          
          // Try to recover
          if (audioRef.current) {
            setTimeout(() => {
              if (isPlaying && audioRef.current) {
                audioRef.current.load();
                audioRef.current.play().catch(e => console.error("Recovery failed:", e));
              }
            }, 1000);
          }
        };
      } catch (error) {
        console.error("Error setting up audio:", error);
        toast({
          title: "Audio Error",
          description: "Failed to set up audio playback",
          variant: "destructive"
        });
      }
    }
    
    return () => {
      // Clean up event listeners
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.onloadedmetadata = null;
        audioRef.current.onstalled = null;
        audioRef.current.onerror = null;
      }
    };
  }, [currentTrack, isPlaying, nextTrack, isRepeatEnabled, setDuration]);
  
  // Handle play/pause 
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Audio playback failed:", error);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])
  
  // Update volume preferences
  useEffect(() => {
    // Only update preferences if the values are different from current preferences
    if (volume !== preferences.volume || isMuted !== preferences.isMuted) {
      updatePreferences({
        volume,
        isMuted
      });
    }
  }, [volume, isMuted, updatePreferences, preferences.volume, preferences.isMuted]);
  
  const handleVolumeChange = (newVolume: number[]) => {
    if (newVolume[0] !== volume) {
      setVolume(newVolume[0])
      if (isMuted && newVolume[0] > 0) {
        setIsMuted(false)
      }
    }
  }
  
  const toggleMute = () => {
    setIsMuted(!isMuted)
  }
  
  const handleProgressChange = (newProgress: number[]) => {
    if (newProgress[0] !== progress && audioRef.current) {
      const progressValue = newProgress[0]
      setProgress(progressValue)
      audioRef.current.currentTime = (progressValue / 100) * (audioRef.current.duration || 0)
    }
  }
  
  // Handle like button click
  const handleLikeClick = () => {
    if (currentTrack) {
      toggleLikeSong(currentTrack)
    }
  }
  
  // Handle download button click
  const handleDownloadClick = () => {
    if (currentTrack) {
      downloadTrack(currentTrack)
    }
  }
  
  if (!currentTrack) {
    return null
  }
  
  return (
    <div className={`bg-background border-t border-border ${className}`}>
      {variant === "expanded" ? (
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-md overflow-hidden">
                <img 
                  src={currentTrack.coverArt} 
                  alt={currentTrack.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <h3 className="font-medium text-lg">{currentTrack.title}</h3>
                <p className="text-muted-foreground">{currentTrack.artist}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLikeClick}
                className={isLiked(currentTrack.id) ? "text-red-500" : ""}
              >
                {isLiked(currentTrack.id) ? <Heart fill="currentColor" /> : <Heart />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleDownloadClick}
              >
                <Download />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{formatTime(progress * duration / 100)}</span>
              <span className="text-sm text-muted-foreground">{formatTime(duration)}</span>
            </div>
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              onValueChange={handleProgressChange}
              className="cursor-pointer"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleShuffle}
                className={isShuffleEnabled ? "text-primary" : ""}
              >
                <Shuffle />
              </Button>
              <Button variant="ghost" size="icon" onClick={previousTrack}>
                <SkipBack />
              </Button>
              <Button 
                className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause /> : <Play />}
              </Button>
              <Button variant="ghost" size="icon" onClick={nextTrack}>
                <SkipForward />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleRepeat}
                className={isRepeatEnabled ? "text-primary" : ""}
              >
                <Repeat />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 w-36">
              <Button variant="ghost" size="icon" onClick={toggleMute}>
                {isMuted || volume === 0 ? <VolumeX /> : <Volume2 />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon">
              <Mic />
            </Button>
            <Button variant="ghost" size="icon">
              <ListMusic />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings />
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="p-2 flex items-center justify-between max-w-3xl mx-auto cursor-pointer"
          onClick={() => onToggleExpand && onToggleExpand()}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-md overflow-hidden">
              <img 
                src={currentTrack.coverArt} 
                alt={currentTrack.title}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="max-w-[150px]">
              <h3 className="font-medium text-sm truncate">{currentTrack.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={previousTrack}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button 
              className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextTrack}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 