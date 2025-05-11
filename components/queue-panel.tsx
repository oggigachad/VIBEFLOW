"use client"

import { X, Play, Trash2, Music } from "lucide-react"
import Image from "next/image"
import type { Song } from "@/lib/types"

type QueuePanelProps = {
  onClose: () => void
  queueSongs: Song[]
  onRemove: (songId: string) => void
  onPlay: (song: Song) => void
}

export default function QueuePanel({ onClose, queueSongs, onRemove, onPlay }: QueuePanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Music className="w-5 h-5" />
          Queue
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {queueSongs.length > 0 ? (
          <div className="space-y-2">
            {queueSongs.map((song) => (
              <div 
                key={song.id} 
                className="flex items-center gap-3 p-2 rounded-md bg-gray-800/50 hover:bg-gray-700/50 transition-colors group"
              >
                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                  <Image 
                    src={song.coverUrl} 
                    alt={song.title} 
                    fill 
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button 
                      onClick={() => onPlay(song)}
                      className="text-white"
                    >
                      <Play className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{song.title}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>
                
                <button 
                  onClick={() => onRemove(song.id)} 
                  className="text-gray-500 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Music className="w-12 h-12 text-gray-600 mb-2" />
            <p className="text-gray-400">Your queue is empty</p>
            <p className="text-xs text-gray-500 mt-1">Add songs to your queue to listen to them next</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          {queueSongs.length} {queueSongs.length === 1 ? 'song' : 'songs'} in queue
        </p>
      </div>
    </div>
  )
} 