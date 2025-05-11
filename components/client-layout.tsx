"use client";

import React, { useEffect } from "react";
import { useSidebar } from "@/contexts/sidebar-context";
import Navbar from "@/components/navbar";
import RootMusicPlayer from "@/components/root-music-player";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  
  const isAuthPage = pathname?.startsWith('/auth');
  
  useEffect(() => {
    document.body.style.overflow = 'auto';
    
    return () => {
      // Cleanup
    };
  }, []);
  
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className={`flex-1 transition-all duration-300 ${collapsed ? 'pl-0' : 'pl-64'}`}>
          {children}
        </main>
        <div className="py-4 px-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} VibeFlow Music
        </div>
      </div>
      <RootMusicPlayer />
      <Toaster />
    </>
  );
} 