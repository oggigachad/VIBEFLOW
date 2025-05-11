"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Music, Mail, Lock, Eye, EyeOff, ArrowRight, Github, XCircle, Disc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

// Update with a complete Google logo (with text)
function GoogleFullLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 24" {...props}>
      {/* Google G Logo */}
      <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" fill="#4285F4"/>
      <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" fill="#EA4335"/>
      <path d="M36.673 15.971c-3.152 0-5.72-2.304-5.72-5.48 0-3.152 2.568-5.48 5.72-5.48 1.72 0 2.952.678 3.882 1.564l-1.088 1.078c-.665-.63-1.564-1.122-2.794-1.122-2.28 0-4.064 1.832-4.064 3.96 0 2.129 1.785 3.96 4.064 3.96 1.484 0 2.323-.594 2.862-1.135.444-.443.736-1.078.85-1.946h-3.712v-1.517h5.257c.056.28.084.62.084 1.05 0 1.178-.323 2.637-1.358 3.674-.976.976-2.24 1.505-3.902 1.505v-.111h.119zm10.94-1.54c-1.232 1.233-2.91 1.233-3.695 1.233-1.514 0-2.792-.56-3.708-1.517-.014-.014-.014-.014-.014-.028v.028c-.886-.928-1.4-2.073-1.4-3.626s.514-2.698 1.4-3.626c.014-.014.014-.014.014-.028l.014.028c.902-.957 2.194-1.517 3.694-1.517.784 0 2.476 0 3.694 1.233l-1.05 1.022c-.98-.9-1.85-.9-2.644-.9-.98 0-1.904.343-2.53 1.022-.784.76-1.008 1.712-1.008 2.766 0 1.053.224 2.005 1.008 2.766.626.678 1.55 1.022 2.53 1.022.784 0 1.554-.224 2.028-.622.334-.223.67-.573.938-1.037h-2.966v-1.413h4.604c.042.307.084.614.084.921 0 1.105-.266 2.003-.979 2.796l.984-1.008zM57 15.48h-1.694l-3.947-6.314V15.5h-1.694V5.303H51.4l3.947 6.314V5.303H57V15.5v-.02zm4.56.503c-2.813 0-5.068-2.143-5.068-4.919 0-2.775 2.255-4.919 5.067-4.919 2.813 0 5.068 2.144 5.068 4.92 0 2.775-2.255 4.918-5.068 4.918zm0-7.74c-1.51 0-2.84 1.217-2.84 2.821 0 1.605 1.33 2.822 2.84 2.822 1.51 0 2.84-1.217 2.84-2.822 0-1.604-1.33-2.822-2.84-2.822zm11.215 7.74c-2.813 0-5.068-2.143-5.068-4.919 0-2.775 2.255-4.919 5.068-4.919 2.813 0 5.068 2.144 5.068 4.92 0 2.775-2.255 4.918-5.068 4.918zm0-7.74c-1.51 0-2.84 1.217-2.84 2.821 0 1.605 1.33 2.822 2.84 2.822 1.51 0 2.84-1.217 2.84-2.822 0-1.604-1.33-2.822-2.84-2.822zm10.024 7.317c-.933 0-1.77-.209-2.415-.57a3.931 3.931 0 01-1.578-1.604l1.503-.633c.514.802 1.237 1.217 2.398 1.217 1.047 0 1.675-.399 1.675-1.093 0-.57-.762-.764-1.618-.93l-1.065-.2c-1.162-.228-2.538-.778-2.538-2.386 0-1.482 1.408-2.556 3.377-2.556 1.294 0 2.42.38 3.11 1.388l-1.447.6c-.486-.626-1.133-.864-1.733-.864-.962 0-1.58.418-1.58 1.008 0 .55.704.74 1.447.874l1.065.209c1.408.285 2.686.854 2.686 2.44 0 1.786-1.694 2.8-3.467 2.8h.18zm7.667-6.865V15.5h-1.733V8.695h-1.514V7.145h1.514V4.19h1.733v2.955h1.514v1.55h-1.514zm5.953 6.865c-2.398 0-4.262-1.93-4.262-4.919 0-2.955 1.864-4.919 4.262-4.919 1.276 0 2.2.512 2.886 1.177l-1.19 1.16c-.457-.45-.98-.74-1.713-.74-1.37 0-2.381 1.121-2.381 3.322 0 2.181 1.01 3.322 2.38 3.322.733 0 1.257-.304 1.552-.607v-1.682h-1.99V9.099h3.69v4.25c-.75.778-1.771 1.55-3.233 1.55z" fill="#757575"/>
    </svg>
  );
}

// Also keep the original Google G logo for options
function GoogleLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" {...props}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bgPosition, setBgPosition] = useState({ x: 0, y: 0 })
  const router = useRouter()
  const { login, loginWithGoogle } = useAuth()
  const { toast } = useToast()

  // Handle mouse movement effect for the background
  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 15
    const y = (e.clientY / window.innerHeight) * 15
    setBgPosition({ x, y })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      // Call login from auth context
      await login(email, password)
      
      // If login doesn't throw an error, consider it successful
      toast({
        title: "Login Successful",
        description: "Welcome back to VibeFlow!"
      })
      router.push("/discover")
    } catch (error) {
      setError("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setEmail("demo@example.com")
    setPassword("demo1234")
    
    try {
      // Call login from auth context
      await login("demo@example.com", "demo1234")
      
      // If login doesn't throw an error, consider it successful
      toast({
        title: "Demo Login Successful",
        description: "You're now browsing as a demo user!"
      })
      router.push("/discover")
    } catch (error) {
      setError("Demo login failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Add Google sign-in handler
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await loginWithGoogle()
      toast({
        title: "Google Sign-In Successful",
        description: "You've been successfully logged in with Google",
      })
      router.push("/discover")
    } catch (error) {
      setError("Google sign-in failed")
      toast({
        title: "Google Sign-In Error",
        description: "Failed to sign in with Google",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Clean up error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div 
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 0.6,
            x: bgPosition.x,
            y: bgPosition.y
          }}
          transition={{ 
            opacity: { duration: 1 },
            x: { duration: 0.2, ease: "linear" },
            y: { duration: 0.2, ease: "linear" }
          }}
          className="absolute -top-[25%] -left-[25%] w-[150%] h-[150%] bg-gradient-to-br from-purple-900/20 via-indigo-800/10 to-blue-900/20 blur-3xl"
        />
        
        {/* Abstract music waves */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-72 opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 2 }}
        >
          <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
            <path 
              fill="url(#gradient1)" 
              d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,170.7C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        
        {/* Floating music notes and discs */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ 
                left: `${Math.random() * 90 + 5}%`, 
                top: `${Math.random() * 90 + 5}%` 
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.2, 0.5, 0.2], 
                scale: [0.7, 1, 0.7], 
                rotate: [0, 180, 360],
                y: [0, -20, 0]
              }}
              transition={{ 
                duration: 5 + i * 2, 
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.5
              }}
            >
              {i % 2 === 0 ? (
                <Disc className="text-purple-500/30" size={20 + i * 5} />
              ) : (
                <Music className="text-blue-500/30" size={20 + i * 5} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and branding */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              duration: 0.6 
            }}
            className="relative h-12 w-12"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-blue-400 rounded-xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-xl">VF</span>
            </div>
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
          >
            VibeFlow
          </motion.span>
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-black/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_0_45px_-15px_rgba(124,58,237,0.5)]"
        >
          <div className="text-center mb-8">
            <motion.h1 
              className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p 
              className="text-gray-300 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              Sign in to unleash the full VibeFlow experience
            </motion.p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-300 p-3 rounded-lg mb-4 flex items-center"
              >
                <XCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-400" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <label htmlFor="email" className="text-sm font-medium block text-gray-200">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-black/60 border-purple-500/30 focus:border-purple-500 rounded-lg h-11 text-white"
                  required
                  disabled={isLoading}
                />
              </div>
            </motion.div>
            
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium block text-gray-200">
                  Password
                </label>
                <Link href="/auth/reset-password" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-black/60 border-purple-500/30 focus:border-purple-500 rounded-lg h-11 text-white"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-11 rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(124,58,237,0.7)]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center font-medium">
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </motion.div>
            
            <motion.div 
              className="relative my-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/50 backdrop-blur-sm px-3 text-gray-400 rounded-full">Or continue with</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleDemoLogin}
                className="border-white/10 bg-purple-600/90 hover:bg-purple-700 h-11 rounded-lg text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                disabled={isLoading}
              >
                <Music className="h-4 w-4" />
                <span className="font-medium">Demo Account</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="border border-gray-300 bg-white hover:bg-gray-50 h-11 rounded-lg text-gray-600 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow px-4"
                disabled={isLoading}
              >
                <GoogleFullLogo width="100" height="24" className="mx-auto" />
              </Button>
            </motion.div>
            
            <motion.div 
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1 }}
            >
              <p className="text-sm text-gray-300">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Sign up for free
                </Link>
              </p>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
