"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

type Lyric = {
  time: number
  text: string
}

type LyricsPanelProps = {
  lyrics: Lyric[]
  currentTime: number
}

export default function LyricsPanel({ lyrics, currentTime }: LyricsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLyricRef = useRef<HTMLDivElement | null>(null)

  // Find the current lyric based on time
  const currentLyricIndex = lyrics.findIndex(
    (lyric, index) =>
      currentTime >= lyric.time && (index === lyrics.length - 1 || currentTime < lyrics[index + 1].time),
  )

  // Scroll to active lyric
  useEffect(() => {
    if (containerRef.current && activeLyricRef.current && currentLyricIndex !== -1) {
      const container = containerRef.current
      const activeLyric = activeLyricRef.current

      const containerHeight = container.clientHeight
      const lyricPosition = activeLyric.offsetTop
      const lyricHeight = activeLyric.clientHeight

      // Calculate the scroll position to center the active lyric
      const scrollPosition = lyricPosition - containerHeight / 2 + lyricHeight / 2

      // Animate scrolling
      gsap.to(container, {
        scrollTop: scrollPosition,
        duration: 0.5,
        ease: "power2.out",
      })
    }
  }, [currentLyricIndex])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto pr-2 pb-4 lyrics-container">
      {lyrics.map((lyric, index) => {
        const isActive = index === currentLyricIndex

        return (
          <div
            key={index}
            ref={isActive ? activeLyricRef : null}
            className={`py-3 transition-all duration-300 ${
              isActive ? "text-purple-400 text-lg font-medium" : "text-gray-400 text-base"
            }`}
          >
            <div className="flex">
              <span className="text-xs text-gray-500 w-10">{formatTime(lyric.time)}</span>
              <span className="flex-1">{lyric.text}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`
}
