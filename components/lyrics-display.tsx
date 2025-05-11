"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Save, X, Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"

// Sample lyrics data structure
interface LyricLine {
  text: string
  timeStart: number // in seconds (not used for syncing but kept for structure)
  timeEnd: number // in seconds (not used for syncing but kept for structure)
}

interface LyricsDisplayProps {
  trackId: string // Used to fetch the correct lyrics
  currentTime: number // Current playback time in seconds (not used for syncing but kept for props compatibility)
}

export default function LyricsDisplay({ trackId, currentTime }: LyricsDisplayProps) {
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [editableText, setEditableText] = useState("")
  const { isAuthenticated } = useAuth()

  // Add animation states
  const [activeAnimation, setActiveAnimation] = useState<"wave" | "pulse" | "bounce" | "none">("wave")
  const [animationSpeed, setAnimationSpeed] = useState<"slow" | "medium" | "fast">("medium")
  
  // Animation cycle for non-synced lyrics
  useEffect(() => {
    if (lyrics.length === 0) return
    
    // Set up a simple interval to cycle through lyrics for animation effect 
    // regardless of actual song playback position
    const animationInterval = setInterval(() => {
      setCurrentLineIndex(prevIndex => (prevIndex + 1) % lyrics.length)
    }, 
    // Animation speed based on selection
    animationSpeed === "slow" ? 4000 : 
    animationSpeed === "medium" ? 2500 : 
    1500) // fast
    
    return () => clearInterval(animationInterval)
  }, [lyrics, animationSpeed])

  // Helper function to get sample lyrics with timing based on trackId
  const getSampleLyrics = useCallback((id: string): LyricLine[] => {
    // Sample lyrics for different tracks
    const trackLyrics: Record<string, LyricLine[]> = {
      track1: [ // Levitating - Dua Lipa
        { text: "If you wanna run away with me", timeStart: 12, timeEnd: 16 },
        { text: "I know a galaxy and I can take you for a ride", timeStart: 16, timeEnd: 20 },
        { text: "I had a premonition that we fell into a rhythm", timeStart: 20, timeEnd: 24 },
        { text: "Where the music don't stop for life", timeStart: 24, timeEnd: 28 },
        { text: "Glitter in the sky, glitter in my eyes", timeStart: 28, timeEnd: 32 },
        { text: "Shining just the way I like", timeStart: 32, timeEnd: 36 },
        { text: "If you're feeling like you need a little bit of company", timeStart: 36, timeEnd: 40 },
        { text: "You met me at the perfect time", timeStart: 40, timeEnd: 44 },
        { text: "You want me, I want you, baby", timeStart: 44, timeEnd: 48 },
        { text: "My sugarboo, I'm levitating", timeStart: 48, timeEnd: 52 },
        { text: "The Milky Way, we're renegading", timeStart: 52, timeEnd: 56 },
        { text: "Yeah, yeah, yeah, yeah, yeah", timeStart: 56, timeEnd: 60 }
      ],
      track2: [ // Starboy - The Weeknd
        { text: "I'm tryna put you in the worst mood, ah", timeStart: 15, timeEnd: 19 },
        { text: "P1 cleaner than your church shoes, ah", timeStart: 19, timeEnd: 23 },
        { text: "Milli point two just to hurt you, ah", timeStart: 23, timeEnd: 27 },
        { text: "All red Lamb' just to tease you, ah", timeStart: 27, timeEnd: 31 },
        { text: "None of these toys on lease too, ah", timeStart: 31, timeEnd: 35 },
        { text: "Made your whole year in a week too, yeah", timeStart: 35, timeEnd: 39 },
        { text: "Main bitch out your league too, ah", timeStart: 39, timeEnd: 43 },
        { text: "Side bitch out of your league too, ah", timeStart: 43, timeEnd: 47 },
        { text: "House so empty, need a centerpiece", timeStart: 47, timeEnd: 51 },
        { text: "Twenty racks a table cut from ebony", timeStart: 51, timeEnd: 55 },
        { text: "Cut that ivory into skinny pieces", timeStart: 55, timeEnd: 59 },
        { text: "Then she clean it with her face man I love my baby", timeStart: 59, timeEnd: 63 }
      ],
      track16: [ // Moonlight - XXXTENTACION
        { text: "Spotlight, uh, moonlight, uh", timeStart: 5, timeEnd: 10 },
        { text: "Nigga, why you trippin'? Get your mood right, uh", timeStart: 10, timeEnd: 15 },
        { text: "Spotlight, moonlight", timeStart: 15, timeEnd: 18 },
        { text: "Nigga, why you trippin'? Get your mood right", timeStart: 18, timeEnd: 22 },
        { text: "Spotlight, uh, moonlight", timeStart: 22, timeEnd: 26 },
        { text: "Nigga, why you trippin'? Get your mood right, uh", timeStart: 26, timeEnd: 30 },
        { text: "Spotlight, moonlight", timeStart: 30, timeEnd: 33 },
        { text: "Nigga, why you trippin'? Get your mood right", timeStart: 33, timeEnd: 37 },
        { text: "Feel like I'm destined", timeStart: 37, timeEnd: 40 },
        { text: "I don't need no Smith & Wesson, no", timeStart: 40, timeEnd: 44 },
        { text: "Girl, who you testin'?", timeStart: 44, timeEnd: 47 },
        { text: "Fucks sake, stop stressin'", timeStart: 47, timeEnd: 50 }
      ],
      track17: [ // The Box - Roddy Ricch
        { text: "Pullin' out the coupe at the lot", timeStart: 11, timeEnd: 14 },
        { text: "Told 'em 'F**k 12, f**k SWAT'", timeStart: 14, timeEnd: 17 },
        { text: "Bustin' all the bells out the box", timeStart: 17, timeEnd: 20 },
        { text: "I just hit a lick with the box", timeStart: 20, timeEnd: 23 },
        { text: "Had to put the stick in the box, mmm", timeStart: 23, timeEnd: 26 },
        { text: "Pour up the whole damn seal, I'ma get lazy", timeStart: 26, timeEnd: 29 },
        { text: "I got the mojo deals, we been trappin' like the '80s", timeStart: 29, timeEnd: 32 },
        { text: "She sucked a n****'s soul, gotta Cash App", timeStart: 32, timeEnd: 35 },
        { text: "With the phone lights up, I don't even know her name", timeStart: 35, timeEnd: 38 },
        { text: "I gotta go on the next day", timeStart: 38, timeEnd: 41 },
        { text: "I'm runnin' out of drugs and speed", timeStart: 41, timeEnd: 44 },
        { text: "I'm on Sunset Boulevard like", timeStart: 44, timeEnd: 47 }
      ],
      track19: [ // Espresso - Sabrina Carpenter
        { text: "That's that espresso", timeStart: 10, timeEnd: 13 },
        { text: "Mhm, that's that espresso", timeStart: 13, timeEnd: 16 },
        { text: "You know, that's that espresso, mhm", timeStart: 16, timeEnd: 19 },
        { text: "That's that good sh*t", timeStart: 19, timeEnd: 22 },
        { text: "You want me like espresso", timeStart: 22, timeEnd: 25 },
        { text: "So sweet with a bitter aftertaste", timeStart: 25, timeEnd: 28 },
        { text: "You like me better when I'm gone, but not that long", timeStart: 28, timeEnd: 31 },
        { text: "'Cause then you miss the taste", timeStart: 31, timeEnd: 34 },
        { text: "I seen your girl's at home, but you don't look alone", timeStart: 34, timeEnd: 37 },
        { text: "And when you seem calm, you're the most stressed", timeStart: 37, timeEnd: 40 },
        { text: "Boy, you like your coffee hot, you hate it when it cools", timeStart: 40, timeEnd: 43 },
        { text: "You see me takin' sips and you wish it's you", timeStart: 43, timeEnd: 46 }
      ],
      // Default empty lyrics if track not found
      default: [
        { text: "Lyrics not available for this track", timeStart: 0, timeEnd: 10 }
      ]
    };
    
    // First try to get from localStorage for user-uploaded lyrics
    const userLyrics = localStorage.getItem(`lyrics_${id}`)
    if (userLyrics) {
      try {
        // Parse from a simple text format to our data structure
        const lines = userLyrics.split('\n')
          .filter(line => line.trim() !== '')
          .map((line, index) => ({
            text: line,
            timeStart: index * 4, // Just assign sequential timing
            timeEnd: (index + 1) * 4
          }))
        return lines
      } catch (error) {
        console.error("Error parsing user lyrics:", error)
      }
    }
    
    return trackLyrics[id] || trackLyrics.default || [{ text: "Lyrics not available for this track", timeStart: 0, timeEnd: 10 }]
  }, [])

  // Fetch lyrics from the server based on trackId
  useEffect(() => {
    const fetchLyrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to load from localStorage first for user uploaded lyrics
        const userLyrics = localStorage.getItem(`lyrics_${trackId}`)
        if (userLyrics) {
          const lines = userLyrics.split('\n')
            .filter(line => line.trim() !== '')
            .map((line, index) => ({
              text: line,
              timeStart: index * 4,
              timeEnd: (index + 1) * 4
            }))
          setLyrics(lines)
          setEditableText(userLyrics)
        } else {
          // Get lyrics from the sample data
          const sampleLines = getSampleLyrics(trackId);
          setLyrics(sampleLines);
          setEditableText(sampleLines.map(line => line.text).join('\n'));
        }
      } catch (error) {
        console.error("Error loading lyrics:", error);
        setError("Lyrics unavailable for this track");
        setLyrics([{ text: "Lyrics not available for this track", timeStart: 0, timeEnd: 100 }]);
        setEditableText("Lyrics not available for this track");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLyrics();
  }, [trackId, getSampleLyrics])
  
  // Handle saving edited lyrics
  const handleSaveLyrics = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to edit lyrics",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Save to localStorage
      localStorage.setItem(`lyrics_${trackId}`, editableText)
      
      // Convert text to lyrics structure
      const newLyrics = editableText.split('\n')
        .filter(line => line.trim() !== '')
        .map((line, index) => ({
          text: line,
          timeStart: index * 4,
          timeEnd: (index + 1) * 4
        }))
      
      setLyrics(newLyrics)
      setEditMode(false)
      
      toast({
        title: "Lyrics Saved",
        description: "Your changes have been saved successfully"
      })
    } catch (error) {
      console.error("Error saving lyrics:", error)
      toast({
        title: "Error Saving Lyrics",
        description: "There was a problem saving your lyrics",
        variant: "destructive"
      })
    }
  }
  
  // Handle canceling edit mode
  const handleCancelEdit = () => {
    // Reset editable text to current lyrics
    setEditableText(lyrics.map(line => line.text).join('\n'))
    setEditMode(false)
  }
  
  // Handle file upload for lyrics
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload lyrics",
        variant: "destructive"
      })
      return
    }
    
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) {
        setEditableText(text)
        setEditMode(true)
      }
    }
    reader.readAsText(file)
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading lyrics...</p>
      </div>
    );
  }

  if (editMode) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Edit Lyrics</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancelEdit}
              className="flex items-center gap-1"
            >
              <X size={14} />
              Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSaveLyrics}
              className="flex items-center gap-1"
            >
              <Save size={14} />
              Save
            </Button>
          </div>
        </div>
        
        <Textarea 
          value={editableText}
          onChange={(e) => setEditableText(e.target.value)}
          placeholder="Enter lyrics here, one line per verse..."
          className="flex-1 resize-none bg-black/20 border-purple-500/30 focus:border-purple-500"
        />
      </div>
    )
  }

  if (lyrics.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground text-lg">No lyrics available for this track</p>
        {isAuthenticated && (
          <div className="mt-4">
            <input
              type="file"
              id="lyric-upload"
              className="hidden"
              accept=".txt"
              onChange={handleFileUpload}
            />
            <label htmlFor="lyric-upload">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                asChild
              >
                <span>
                  <Upload size={14} />
                  Upload Lyrics
                </span>
              </Button>
            </label>
          </div>
        )}
      </div>
    )
  }

  // Define animation variants based on selected animation
  const getAnimationVariants = () => {
    switch (activeAnimation) {
      case "wave":
        return {
          initial: { opacity: 0.5, y: 20 },
          animate: (custom: number) => ({ 
            opacity: custom ? 1 : 0.6,
            y: custom ? 0 : 10,
            transition: { 
              duration: animationSpeed === "slow" ? 1.2 : 
                         animationSpeed === "medium" ? 0.8 : 0.5 
            }
          })
        }
      case "pulse":
        return {
          initial: { opacity: 0.5, scale: 0.97 },
          animate: (custom: number) => ({ 
            opacity: custom ? 1 : 0.6,
            scale: custom ? 1.05 : 0.98,
            transition: { 
              duration: animationSpeed === "slow" ? 1.5 : 
                         animationSpeed === "medium" ? 1 : 0.7 
            }
          })
        }
      case "bounce":
        return {
          initial: { opacity: 0.5, y: 0 },
          animate: (custom: number) => ({ 
            opacity: custom ? 1 : 0.6,
            y: custom ? [0, -8, 0] : 0,
            transition: { 
              duration: animationSpeed === "slow" ? 1.8 : 
                         animationSpeed === "medium" ? 1.2 : 0.8,
              times: [0, 0.5, 1]
            }
          })
        }
      default:
        return {
          initial: { opacity: 0.6 },
          animate: (custom: number) => ({ 
            opacity: custom ? 1 : 0.6,
            transition: { duration: 0.5 }
          })
        }
    }
  }

  const animationVariants = getAnimationVariants()

  // Calculate visible range - show 5 lines before and after current line
  const visibleStart = Math.max(0, currentLineIndex - 5)
  const visibleEnd = Math.min(lyrics.length, currentLineIndex + 6)
  const visibleLyrics = lyrics.slice(visibleStart, visibleEnd)

  return (
    <div className="h-full flex flex-col p-4 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Lyrics</h3>
        
        <div className="flex gap-1">
          {/* Animation controls */}
          <div className="flex border border-gray-800 rounded overflow-hidden mr-2">
            <button 
              onClick={() => setActiveAnimation("wave")}
              className={cn(
                "px-2 py-1 text-xs",
                activeAnimation === "wave" ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:bg-gray-800"
              )}
            >
              Wave
            </button>
            <button 
              onClick={() => setActiveAnimation("pulse")}
              className={cn(
                "px-2 py-1 text-xs",
                activeAnimation === "pulse" ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:bg-gray-800"
              )}
            >
              Pulse
            </button>
            <button 
              onClick={() => setActiveAnimation("bounce")}
              className={cn(
                "px-2 py-1 text-xs",
                activeAnimation === "bounce" ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:bg-gray-800"
              )}
            >
              Bounce
            </button>
            <button 
              onClick={() => setActiveAnimation("none")}
              className={cn(
                "px-2 py-1 text-xs",
                activeAnimation === "none" ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:bg-gray-800"
              )}
            >
              None
            </button>
          </div>
          
          {/* Speed control */}
          <div className="flex border border-gray-800 rounded overflow-hidden mr-2">
            <button 
              onClick={() => setAnimationSpeed("slow")}
              className={cn(
                "px-2 py-1 text-xs",
                animationSpeed === "slow" ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:bg-gray-800"
              )}
            >
              Slow
            </button>
            <button 
              onClick={() => setAnimationSpeed("medium")}
              className={cn(
                "px-2 py-1 text-xs",
                animationSpeed === "medium" ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:bg-gray-800"
              )}
            >
              Med
            </button>
            <button 
              onClick={() => setAnimationSpeed("fast")}
              className={cn(
                "px-2 py-1 text-xs",
                animationSpeed === "fast" ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:bg-gray-800"
              )}
            >
              Fast
            </button>
          </div>
          
          {isAuthenticated && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setEditMode(true)}
              className="h-7 w-7"
              title="Edit Lyrics"
            >
              <Edit size={14} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto relative">
        <div className="space-y-6 px-2">
          {visibleLyrics.map((line, index) => {
            const actualIndex = index + visibleStart
            const isActive = actualIndex === currentLineIndex
            
            return (
        <motion.div
                key={actualIndex}
                custom={isActive}
                initial="initial"
                animate="animate"
                variants={animationVariants}
                className={cn(
                  "transition-all duration-300",
                  isActive ? "text-primary font-semibold" : "text-foreground"
                )}
              >
                <p className="text-center">{line.text}</p>
                
                {/* Decorative element for active line */}
                {isActive && activeAnimation !== "none" && (
                  <div className="h-1 mt-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: "100%" 
                      }}
                      transition={{ 
                        duration: animationSpeed === "slow" ? 4 : 
                                  animationSpeed === "medium" ? 2.5 : 1.5,
                        ease: "linear"
                      }}
                    />
                  </div>
                )}
        </motion.div>
            )
          })}
        </div>
      </div>
      
      <div className="text-center text-xs text-muted-foreground mt-4">
        {lyrics.length > 1 ? (
          <span>Line {currentLineIndex + 1} of {lyrics.length}</span>
        ) : (
          <span>Add your own lyrics by clicking the edit button</span>
        )}
      </div>
    </div>
  )
}