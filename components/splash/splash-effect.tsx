"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSplash } from "./use-splash"

export function SplashEffect() {
  const { isVisible, message } = useSplash()
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="bg-black/80 backdrop-blur-lg rounded-lg p-8 shadow-lg border border-purple-500/20">
            <h2 className="text-2xl font-bold text-white text-center mb-2">{message}</h2>
            <div className="flex justify-center">
              <div className="mt-2 flex space-x-2">
                {[...Array(3)].map((_, i) => (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      delay: i * 0.2
                    }}
                    className="w-3 h-3 rounded-full bg-purple-500"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 