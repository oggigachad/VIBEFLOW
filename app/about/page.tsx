"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { motion, useAnimation, useInView } from "framer-motion"
import { Github, Twitter, Linkedin, Mail, Music, Code, Globe, Heart, Headphones, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import { developers } from "@/lib/data"

export default function AboutPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  // Refs for each section
  const titleRef = useRef(null)
  const storyRef = useRef(null)
  const featuresRef = useRef(null)
  const teamRef = useRef(null)
  const signupRef = useRef(null)
  const recommendationsRef = useRef(null)
  
  // Animation controls for each section
  const titleControls = useAnimation()
  const storyControls = useAnimation()
  const featuresControls = useAnimation()
  const teamControls = useAnimation()
  const signupControls = useAnimation()
  const recommendationsControls = useAnimation()
  
  // Check if sections are in view
  const isTitleInView = useInView(titleRef, { once: true })
  const isStoryInView = useInView(storyRef, { once: true })
  const isFeaturesInView = useInView(featuresRef, { once: true })
  const isTeamInView = useInView(teamRef, { once: true })
  const isSignupInView = useInView(signupRef, { once: true })
  const isRecommendationsInView = useInView(recommendationsRef, { once: true })

  // Track mouse position for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Animate sections when they come into view
  useEffect(() => {
    if (isTitleInView) titleControls.start("visible")
    if (isStoryInView) storyControls.start("visible")
    if (isFeaturesInView) featuresControls.start("visible")
    if (isTeamInView) teamControls.start("visible")
    if (isSignupInView) signupControls.start("visible")
    if (isRecommendationsInView) recommendationsControls.start("visible")
  }, [
    isTitleInView, titleControls,
    isStoryInView, storyControls,
    isFeaturesInView, featuresControls,
    isTeamInView, teamControls,
    isSignupInView, signupControls,
    isRecommendationsInView, recommendationsControls
  ])

  const features = [
    {
      title: "Personalized Recommendations",
      description: "Our advanced algorithm learns your music taste and suggests songs you'll love.",
      icon: <Music className="w-6 h-6 text-purple-500" />
    },
    {
      title: "High-Quality Streaming",
      description: "Enjoy crystal clear audio with our high-definition streaming technology.",
      icon: <Code className="w-6 h-6 text-purple-500" />
    },
    {
      title: "Cross-Platform Experience",
      description: "Access your music from any device, anywhere, with seamless synchronization.",
      icon: <Globe className="w-6 h-6 text-purple-500" />
    },
    {
      title: "Community Features",
      description: "Share playlists, follow friends, and discover music through your social network.",
      icon: <Heart className="w-6 h-6 text-purple-500" />
    }
  ]

  const spotlightFeatures = [
    {
      title: "Immersive Experience",
      description: "Dive into a world of music with our stunning visual effects and animations",
      image: "/placeholder.svg?height=150&width=150",
      gradient: "from-orange-400 to-red-500"
    },
    {
      title: "Smart Playlists",
      description: "Let our AI create the perfect playlist for any mood or occasion",
      image: "/placeholder.svg?height=150&width=150",
      gradient: "from-blue-400 to-purple-500"
    },
    {
      title: "Sound Visualization",
      description: "See your music come alive with dynamic audio visualizations",
      image: "/placeholder.svg?height=150&width=150",
      gradient: "from-green-400 to-teal-500"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  }

  const titleVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5
      }
    })
  }

  const title = "About VibeFlow"
  
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden pb-24"
      style={{
        backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-pink-600 rounded-full filter blur-3xl opacity-10"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-2/3 right-1/4 w-72 h-72 bg-blue-600 rounded-full filter blur-3xl opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 40, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Title Section */}
        <div className="text-center mb-24" ref={titleRef}>
          <motion.div
            initial="hidden"
            animate={titleControls}
            variants={titleVariants}
            className="inline-block"
          >
            <h1 className="text-6xl font-bold mb-4 relative">
              {title.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  className="inline-block bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text"
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The next generation music streaming platform designed for true music lovers.
            </p>
          </motion.div>
        </div>

        {/* Our Story Section */}
        <section id="story" ref={storyRef} className="mb-24">
          <motion.div
            initial="hidden"
            animate={storyControls}
            variants={containerVariants}
            className="space-y-12"
          >
            <motion.h2 
              variants={itemVariants} 
              className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text"
            >
              Our Story
            </motion.h2>
            
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-8 mb-16">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                <p className="mb-4 text-gray-300">
                  VibeFlow was born out of a passion for music and technology. Our mission is to create the most intuitive and enjoyable music streaming experience for listeners around the world.
                </p>
                <p className="text-gray-300">
                  We believe that music has the power to connect people, evoke emotions, and transform lives. That's why we've built a platform that not only delivers high-quality audio but also helps you discover new music and connect with a community of fellow music lovers.
                </p>
              </div>
              <motion.div 
                className="md:w-1/2 relative h-64 w-full rounded-lg overflow-hidden"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-lg flex items-center justify-center">
                  <Headphones className="w-24 h-24 text-white/50" />
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-8">
              <motion.div 
                className="md:w-1/2 relative h-64 w-full rounded-lg overflow-hidden md:order-1"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-lg flex items-center justify-center">
                  <Music className="w-24 h-24 text-white/50" />
                </div>
              </motion.div>
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold text-white mb-4">Our Journey</h3>
                <p className="mb-4 text-gray-300">
                  Founded in 2023, VibeFlow started as a small project by a group of music enthusiasts and software developers who wanted to create a better music streaming experience.
                </p>
                <p className="text-gray-300">
                  What began as a simple idea has evolved into a comprehensive platform with advanced features like personalized recommendations, high-definition audio, and social sharing capabilities. We're constantly innovating and improving to bring you the best music experience possible.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" ref={featuresRef} className="mb-24">
          <motion.div
            initial="hidden"
            animate={featuresControls}
            variants={containerVariants}
          >
            <motion.h2 
              variants={itemVariants} 
              className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text"
            >
              Features
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700 transition-all"
                >
                  <motion.div 
                    className="mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full w-14 h-14 flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Team Section */}
        <section id="team" ref={teamRef} className="mb-24">
          <motion.div
            initial="hidden"
            animate={teamControls}
            variants={containerVariants}
          >
            <motion.h2 
              variants={itemVariants} 
              className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text"
            >
              Our Team
            </motion.h2>
            
            <div className="flex flex-row items-center justify-center gap-8 max-w-6xl mx-auto">
              {developers.map((dev, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  className="bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden border border-gray-700 transition-all w-full max-w-sm"
                >
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src={dev.image}
                      alt={dev.name}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{dev.name}</h3>
                    <p className="text-purple-400 mb-3">{dev.role}</p>
                    <p className="text-gray-300 mb-4">{dev.bio}</p>
                    <div className="flex space-x-4">
                      <motion.a 
                        href={dev.links.github} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-400 hover:text-white"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Github className="w-5 h-5" />
                      </motion.a>
                      <motion.a 
                        href={dev.links.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-400 hover:text-white"
                        whileHover={{ scale: 1.2, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Twitter className="w-5 h-5" />
                      </motion.a>
                      <motion.a 
                        href={dev.links.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-400 hover:text-white"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Linkedin className="w-5 h-5" />
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Sign Up Section */}
        <section id="signup" ref={signupRef} className="mb-24">
          <motion.div
            initial="hidden"
            animate={signupControls}
            variants={containerVariants}
          >
            <motion.h2 
              variants={itemVariants} 
              className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text"
            >
              <motion.span 
                className="inline-block"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                Unleash Your Sound Journey!
              </motion.span>
            </motion.h2>
            
            <div className="max-w-4xl mx-auto relative">
              <motion.div 
                variants={itemVariants}
                className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg rounded-xl p-12 border-2 border-purple-500 relative overflow-hidden z-10"
                whileHover={{ 
                  boxShadow: "0 0 30px rgba(168, 85, 247, 0.5)",
                }}
              >
                {/* Animated background elements */}
                <motion.div 
                  className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-xl z-0"
                  animate={{
                    scale: [1, 1.5, 1],
                    x: [0, 10, 0],
                    y: [0, -10, 0],
                  }}
                  transition={{ duration: 6, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute -bottom-20 -left-10 w-60 h-60 bg-purple-500 rounded-full opacity-20 blur-xl z-0"
                  animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -10, 0],
                    y: [0, 10, 0],
                  }}
                  transition={{ duration: 8, repeat: Infinity, delay: 1 }}
                />
                
                <div className="relative z-10">
                  <motion.h3 
                    className="text-2xl font-bold text-white mb-6"
                    animate={{ 
                      color: ["#ffffff", "#d8b4fe", "#ffffff"],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Join The Vibe Tribe!
                  </motion.h3>
                  
                  <ul className="space-y-3 mb-8">
                    <motion.li 
                      className="flex items-center text-gray-300"
                      whileHover={{ x: 5 }}
                    >
                      <div className="mr-2 text-green-400">✓</div>
                      <span className="bg-gradient-to-r from-purple-300 to-pink-300 text-transparent bg-clip-text font-medium">Unlimited music streaming</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-center text-gray-300"
                      whileHover={{ x: 5 }}
                    >
                      <div className="mr-2 text-green-400">✓</div>
                      <span className="bg-gradient-to-r from-purple-300 to-pink-300 text-transparent bg-clip-text font-medium">AI-powered recommendations</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-center text-gray-300"
                      whileHover={{ x: 5 }}
                    >
                      <div className="mr-2 text-green-400">✓</div>
                      <span className="bg-gradient-to-r from-purple-300 to-pink-300 text-transparent bg-clip-text font-medium">Exclusive visualizer effects</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-center text-gray-300"
                      whileHover={{ x: 5 }}
                    >
                      <div className="mr-2 text-green-400">✓</div>
                      <span className="bg-gradient-to-r from-purple-300 to-pink-300 text-transparent bg-clip-text font-medium">Create unlimited playlists</span>
                    </motion.li>
                  </ul>
                  
                  {/* Visualizer Feature Highlight */}
                  <div className="mb-8 bg-black/30 rounded-lg p-4 border border-purple-500/30">
                    <h4 className="text-lg font-bold mb-2 text-white">Advanced Audio Visualizer</h4>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className="w-full md:w-1/2">
                        <p className="text-gray-300 mb-2 text-sm">Our 100% efficient real-time audio visualizer transforms your music into stunning visual patterns with:</p>
                        <ul className="text-sm text-gray-300 space-y-1 mb-2">
                          <li className="flex items-center">
                            <div className="mr-2 text-purple-400">•</div>
                            <span>High-resolution frequency analysis</span>
                          </li>
                          <li className="flex items-center">
                            <div className="mr-2 text-purple-400">•</div>
                            <span>60+ FPS smooth animations</span>
                          </li>
                          <li className="flex items-center">
                            <div className="mr-2 text-purple-400">•</div>
                            <span>Multiple visualization styles</span>
                          </li>
                        </ul>
                      </div>
                      <div className="w-full md:w-1/2 h-24 relative bg-black/50 rounded overflow-hidden">
                        <motion.div 
                          className="absolute inset-0 flex items-end justify-around px-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {[...Array(20)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-[3px] bg-gradient-to-t from-purple-600 to-pink-500 rounded-t"
                              animate={{ 
                                height: [
                                  `${20 + Math.sin(i * 0.5) * 15}%`,
                                  `${50 + Math.sin(i * 0.5 + 1) * 30}%`,
                                  `${30 + Math.sin(i * 0.5 + 2) * 20}%`,
                                  `${70 + Math.sin(i * 0.5 + 3) * 25}%`,
                                  `${20 + Math.sin(i * 0.5) * 15}%`
                                ]
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                repeatType: "reverse",
                                delay: i * 0.05
                              }}
                            />
                          ))}
                        </motion.div>
                        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-purple-500/50"></div>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                    <Link href="/auth/register" className="relative block w-full py-3 px-6 bg-black text-white font-bold rounded-lg text-center group-hover:bg-gray-900 transition-all">
                      <div className="flex items-center justify-center">
                        <span className="mr-2">Get Your Vibe On</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <ArrowRight className="h-5 w-5" />
                        </motion.div>
                      </div>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Floating music notes */}
              <motion.div 
                className="absolute -top-10 -left-10 text-purple-400 text-4xl"
                animate={{ 
                  y: [-20, -60],
                  x: [0, 15],
                  opacity: [0, 1, 0],
                  rotate: [0, 20]
                }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "loop" }}
              >
                ♪
              </motion.div>
              <motion.div 
                className="absolute top-20 -right-5 text-pink-400 text-3xl"
                animate={{ 
                  y: [-20, -80],
                  x: [0, -20],
                  opacity: [0, 1, 0],
                  rotate: [0, -30]
                }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "loop", delay: 1 }}
              >
                ♫
              </motion.div>
              <motion.div 
                className="absolute bottom-10 -left-5 text-blue-400 text-4xl"
                animate={{ 
                  y: [0, -60],
                  x: [0, 10],
                  opacity: [0, 1, 0],
                  rotate: [0, 10]
                }}
                transition={{ duration: 4.5, repeat: Infinity, repeatType: "loop", delay: 2 }}
              >
                ♩
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Contact Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Get in Touch</h2>
          <p className="text-gray-300 mb-6">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <motion.a
            href="mailto:contact@vibeflow.com"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg transition-all"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 15px rgba(168, 85, 247, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Mail className="mr-2 h-5 w-5" />
            Contact Us
          </motion.a>
        </motion.div>
      </div>
    </div>
  )
} 