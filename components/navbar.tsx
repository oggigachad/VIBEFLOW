"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Library, Search, User, Info, Settings, Music2, LogIn, Menu, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThemeModeToggle } from "@/components/theme-mode-toggle"
import { useState, useEffect } from "react"
import { useSidebar } from "@/contexts/sidebar-context"

export default function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { collapsed, setCollapsed } = useSidebar()

  const navItems = [
    {
      name: "Home",
      href: "/discover",
      icon: Home,
    },
    {
      name: "Library",
      href: "/library",
      icon: Library,
    },
    {
      name: "Artists",
      href: "/artists",
      icon: Music2,
    },
    {
      name: "About",
      href: "/about",
      icon: Info,
    },
  ]

  return (
    <>
      {/* Toggle button - visible when sidebar is collapsed */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "fixed top-5 left-5 z-50 h-10 w-10 rounded-full bg-purple-600/90 hover:bg-purple-700/90 backdrop-blur-md border border-white/20 shadow-lg transition-all duration-300",
          collapsed ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <Menu size={18} className="text-white" />
      </Button>
      
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 bg-black/50 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ease-in-out",
        collapsed ? "w-0 opacity-90 -translate-x-full" : "w-64"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <Link href="/discover" className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-blue-400 rounded-md" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">VF</span>
                </div>
              </div>
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
                  >
                    VibeFlow
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(true)}
              className="h-8 w-8 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </Button>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative",
                        isActive
                          ? "text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <item.icon className="h-5 w-5" />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </li>
                )
              })}
            </ul>
            
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-white/10"
                >
                  <p className="px-4 py-2 text-xs text-gray-500 uppercase font-medium">Account</p>
                  <ul className="space-y-2">
                    {user ? (
                      <>
                        <li>
                          <Link
                            href="/profile"
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative",
                              pathname === "/profile"
                                ? "text-white"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                          >
                            {pathname === "/profile" && (
                              <motion.div
                                layoutId="navbar-profile-indicator"
                                className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg -z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px] bg-purple-800">
                                {user.displayName?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span>Profile</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/settings"
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative",
                              pathname === "/settings"
                                ? "text-white"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                          >
                            {pathname === "/settings" && (
                              <motion.div
                                layoutId="navbar-settings-indicator"
                                className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg -z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                            <Settings className="h-5 w-5" />
                            <span>Settings</span>
                          </Link>
                        </li>
                      </>
                    ) : (
                      <li>
                        <Link
                          href="/auth"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <LogIn className="h-5 w-5" />
                          <span>Sign In</span>
                        </Link>
                      </li>
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4"
              >
                <div className="p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-300">
                      VibeFlow Music
                    </p>
                    <ThemeModeToggle />
                  </div>
                  <p className="text-xs text-gray-400">
                    © 2023 VibeFlow
                  </p>
                  {!user && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-xs text-gray-400">
                        Join the Vibe Tribe today!
                      </p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-purple-400 hover:text-purple-300 p-0 h-auto mt-1 text-xs"
                        asChild
                      >
                        <Link href="/auth">Sign up now</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
