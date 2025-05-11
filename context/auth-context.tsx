"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"
import { GoogleAuthProvider, signInWithPopup, Auth, User as FirebaseUser } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Auth as AuthType } from "firebase/auth"

// Type assertion for auth
const firebaseAuth = auth as AuthType | null;

// Define user type
interface User {
  id: string
  email: string
  displayName: string | null
  photoURL: string | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  loginWithGoogle: () => Promise<User | void>
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => { throw new Error("Not implemented") },
  register: async () => { throw new Error("Not implemented") },
  logout: async () => { throw new Error("Not implemented") },
  resetPassword: async () => { throw new Error("Not implemented") },
  loginWithGoogle: async () => { throw new Error("Not implemented") }
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("vibeflow_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("vibeflow_user")
      }
    }
    setIsLoading(false)
  }, [])
  
  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      // For demo purposes, we're using a simplified authentication
      // In a real app, you would call your auth API here
      
      // Check for demo account
      if (email === "demo@example.com" && password === "demo1234") {
        const demoUser: User = {
          id: "demo-user-id",
          email: "demo@example.com",
          displayName: "Demo User",
          photoURL: null
        }
        
        setUser(demoUser)
        localStorage.setItem("vibeflow_user", JSON.stringify(demoUser))
        return
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For simplicity, let's just accept any valid email format with a password longer than 6 chars
      if (email.includes('@') && password.length >= 6) {
        const newUser: User = {
          id: `user-${Date.now()}`,
          email,
          displayName: email.split('@')[0],
          photoURL: null
        }
        
        setUser(newUser)
        localStorage.setItem("vibeflow_user", JSON.stringify(newUser))
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  // Register function
  const register = async (email: string, password: string, displayName: string) => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For simplicity, just accept any valid email format with a password longer than 6 chars
      if (email.includes('@') && password.length >= 6) {
        const newUser: User = {
          id: `user-${Date.now()}`,
          email,
          displayName,
          photoURL: null
        }
        
        setUser(newUser)
        localStorage.setItem("vibeflow_user", JSON.stringify(newUser))
      } else {
        throw new Error("Invalid registration data")
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  // Google Sign In function
  const loginWithGoogle = async () => {
    setIsLoading(true)
    
    try {
      // Check if Firebase auth is available
      if (!firebaseAuth) {
        throw new Error("Authentication service not available");
      }
      
      // Use Firebase Google authentication
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(firebaseAuth, provider)
      
      if (result.user) {
        // Create user object from Firebase user
        const googleUser: User = {
          id: result.user.uid,
          email: result.user.email || `user${Date.now()}@gmail.com`,
          displayName: result.user.displayName || `Google User`,
          photoURL: result.user.photoURL
        }
        
        setUser(googleUser)
        localStorage.setItem("vibeflow_user", JSON.stringify(googleUser))
        
        return googleUser
      } else {
        throw new Error("No user returned from Google authentication")
      }
    } catch (error) {
      console.error("Google sign-in error:", error)
      throw new Error("Failed to sign in with Google")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Logout function
  const logout = async () => {
    try {
      // Clear user data
      setUser(null)
      localStorage.removeItem("vibeflow_user")
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out from VibeFlow"
      })
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }
  
  // Reset password function
  const resetPassword = async (email: string) => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, you would send a password reset email
      toast({
        title: "Password Reset Email Sent",
        description: `If an account exists with ${email}, you will receive a password reset link`
      })
    } catch (error) {
      console.error("Password reset error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    loginWithGoogle
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  
  return context
}
