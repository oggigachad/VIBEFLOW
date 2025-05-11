"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Github, Linkedin, Twitter, Mail, Code, Music, Heart } from "lucide-react"

interface DeveloperProfileProps {
  isOpen: boolean
  onClose: () => void
}

export default function DeveloperProfile({ isOpen, onClose }: DeveloperProfileProps) {
  // Developer info - Replace with your own
  const developer = {
    name: "John Doe",
    title: "Full Stack Developer",
    bio: "Music enthusiast and developer passionate about creating beautiful web experiences and audio applications.",
    avatar: "/developer-avatar.jpg", // Add your image to public folder
    github: "https://github.com/johndoe",
    linkedin: "https://linkedin.com/in/johndoe",
    twitter: "https://twitter.com/johndoe",
    email: "mailto:john@example.com",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "Web Audio API", "Animation"],
  }

  // Particles for background effect
  const [particles, setParticles] = useState<{ x: number; y: number; size: number; color: string; speed: number }[]>([])
  
  // Generate particles on mount
  useEffect(() => {
    if (isOpen) {
      const newParticles = Array.from({ length: 30 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        color: `hsl(${Math.random() * 60 + 240}, 70%, ${Math.random() * 30 + 50}%)`,
        speed: Math.random() * 0.5 + 0.1,
      }))
      setParticles(newParticles)

      // Animation interval
      const interval = setInterval(() => {
        setParticles(prev => 
          prev.map(p => ({
            ...p,
            y: p.y <= 0 ? 100 : p.y - p.speed,
          }))
        )
      }, 50)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60"
          onClick={onClose}
        >
          {/* Particles background */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
          
          {/* Profile card */}
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative max-w-md w-full p-6 rounded-2xl z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pulsating ring */}
            <div className="absolute left-1/2 top-24 -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 opacity-30 animate-ping" />
            
            {/* Profile content */}
            <div className="flex flex-col items-center text-center">
              {/* Avatar with rotating ring */}
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 animate-spin-slow" style={{ padding: '4px' }} />
                
                <motion.div 
                  className="w-36 h-36 rounded-full border-4 border-white overflow-hidden relative z-10 bg-gray-900"
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  transition={{ type: "spring", damping: 10 }}
                >
                  <Image 
                    src={developer.avatar} 
                    alt={developer.name} 
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback for missing image
                      e.currentTarget.src = "https://via.placeholder.com/200"
                    }}
                  />
                </motion.div>
                
                {/* Floating icons around the avatar */}
                <motion.div 
                  className="absolute -top-4 -right-4 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Code className="w-5 h-5 text-white" />
                </motion.div>
                
                <motion.div 
                  className="absolute -bottom-4 -left-4 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                >
                  <Music className="w-5 h-5 text-white" />
                </motion.div>
              </div>
              
              {/* Developer info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-white">{developer.name}</h2>
                <p className="text-purple-300 mb-4">{developer.title}</p>
                <p className="text-gray-300 mb-6 max-w-xs mx-auto">{developer.bio}</p>
                
                {/* Skills */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {developer.skills.map((skill, index) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="px-3 py-1 bg-gray-800 text-purple-300 rounded-full text-sm"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
                
                {/* Social links */}
                <div className="flex justify-center gap-4 mb-6">
                  <a href={developer.github} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors">
                    <Github className="w-5 h-5 text-white" />
                  </a>
                  <a href={developer.linkedin} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors">
                    <Linkedin className="w-5 h-5 text-white" />
                  </a>
                  <a href={developer.twitter} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors">
                    <Twitter className="w-5 h-5 text-white" />
                  </a>
                  <a href={developer.email} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors">
                    <Mail className="w-5 h-5 text-white" />
                  </a>
                </div>
                
                {/* Signature */}
                <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                  <span>Made with</span>
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                  <span>and Web Audio API</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Add this to your global CSS or specific component
// .animate-spin-slow {
//   animation: spin 10s linear infinite;
// }
// @keyframes spin {
//   to {
//     transform: rotate(360deg);
//   }
// } 