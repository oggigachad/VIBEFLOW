"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/context/auth-context"
import { useSplash } from "@/components/splash/use-splash"
import { Loader2, Music, Mail, Lock, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

const signupSchema = loginSchema
  .extend({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type LoginFormValues = z.infer<typeof loginSchema>
type SignupFormValues = z.infer<typeof signupSchema>

interface AuthFormProps {
  isSignUp: boolean
  setIsSignUp: (value: boolean) => void
  redirectPath?: string
}

export function AuthForm({ isSignUp, setIsSignUp, redirectPath = "/" }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login, register, loginWithGoogle, user } = useAuth()
  const { showSplash } = useSplash()
  const router = useRouter()
  const { toast } = useToast()
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/discover")
    }
  }, [user, router])

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setIsGoogleLoading(false)
    setError(null)
    
    try {
      if (isSignUp) {
        await register(signupForm.getValues().email, signupForm.getValues().password, signupForm.getValues().name)
        toast({
          title: "Account created!",
          description: "You've been successfully registered and logged in.",
        })
      } else {
        await login(loginForm.getValues().email, loginForm.getValues().password)
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        })
      }
      
      // Redirect after successful auth
      router.push(redirectPath)
    } catch (error: any) {
      setError(error.message)
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsGoogleLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setIsGoogleLoading(true)
    setError(null)
    
    try {
      await loginWithGoogle()
      toast({
        title: "Welcome to VibeFlow!",
        description: "You've been successfully logged in with Google.",
      })
      router.push(redirectPath)
    } catch (error: any) {
      setError(error.message)
      toast({
        title: "Google Sign-In Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsGoogleLoading(false)
    }
  }

  const toggleForm = () => {
    showSplash("Switching forms")
    setIsSignUp(!isSignUp)
    // Clear any errors when switching forms
    loginForm.clearErrors()
    signupForm.clearErrors()
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto p-8 bg-black/50 backdrop-blur-lg rounded-xl border border-purple-500/20 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h1>
        <p className="text-gray-400">
          {isSignUp
            ? "Join the Vibe Tribe and enjoy unlimited music"
            : "Sign in to unlock your personalized experience"}
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                id="name"
                type="text"
                value={signupForm.getValues().name}
                onChange={(e) => signupForm.setValue("name", e.target.value)}
                className="pl-10 bg-black/30 border-purple-500/30 focus:border-purple-500"
                placeholder="Enter your name"
                required={isSignUp}
                disabled={isLoading}
              />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              id="email"
              type="email"
              value={isSignUp ? signupForm.getValues().email : loginForm.getValues().email}
              onChange={(e) => {
                if (isSignUp) {
                  signupForm.setValue("email", e.target.value)
                } else {
                  loginForm.setValue("email", e.target.value)
                }
              }}
              className="pl-10 bg-black/30 border-purple-500/30 focus:border-purple-500"
              placeholder="your@email.com"
              required
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              id="password"
              type="password"
              value={isSignUp ? signupForm.getValues().password : loginForm.getValues().password}
              onChange={(e) => {
                if (isSignUp) {
                  signupForm.setValue("password", e.target.value)
                } else {
                  loginForm.setValue("password", e.target.value)
                }
              }}
              className="pl-10 bg-black/30 border-purple-500/30 focus:border-purple-500"
              placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isSignUp ? "Creating Account..." : "Signing In..."}
            </>
          ) : (
            isSignUp ? "Create Account" : "Sign In"
          )}
        </Button>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-background text-gray-400 text-sm">Or continue with</span>
          </div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          className="w-full border-purple-500/30 hover:bg-purple-500/10"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
          Google
        </Button>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <Button
              type="button"
              variant="link"
              className="text-purple-400 hover:text-purple-300 ml-1"
              onClick={toggleForm}
              disabled={isLoading}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </Button>
          </p>
        </div>
      </form>
    </motion.div>
  )
} 