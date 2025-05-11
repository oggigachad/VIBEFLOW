"use client"

import { FC } from "react"
import Link from "next/link"
import { Github, Heart, Music } from "lucide-react"

const Footer: FC = () => {
  return (
    <footer className="border-t border-gray-800 bg-black/40 backdrop-blur-lg py-6">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Music className="h-5 w-5 text-purple-500 mr-2" />
            <span className="text-sm font-medium">VibeFlow Music</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/about" 
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Terms
            </Link>
            <a 
              href="https://github.com/yourusername/vibeflow" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center"
            >
              <Github className="h-4 w-4 mr-1" />
              GitHub
            </a>
          </div>
          
          <div className="flex items-center mt-4 md:mt-0">
            <span className="text-xs text-gray-500 flex items-center">
              Made with <Heart className="h-3 w-3 text-red-500 mx-1" /> in 2023
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 