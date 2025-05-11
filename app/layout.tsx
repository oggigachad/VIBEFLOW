import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import RootMusicPlayer from "@/components/root-music-player"
import { MusicProvider } from "@/context/music-context"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { SettingsProvider } from "@/context/settings-context"
import { UserStatsProvider } from "@/context/user-stats-context"
import { SplashProvider } from "@/components/splash/splash-provider"
import { PreferencesProvider } from "@/context/preferences-context"
import Script from "next/script"
import { LibraryProvider } from "@/context/library-context"
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider } from "@/contexts/sidebar-context"
import ClientLayout from "@/components/client-layout"
import "@/lib/firebase"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VibeFlow - Music Streaming App",
  description: "A modern music streaming application with immersive audio visualization"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              // Apply dark mode immediately to prevent flash
              document.documentElement.classList.add('dark');
              
              // Also apply saved color theme mode
              const savedColorMode = localStorage.getItem('vibeflow-color-mode');
              if (savedColorMode && ['default', 'purple', 'blue', 'green', 'amber'].includes(savedColorMode)) {
                document.documentElement.classList.add('theme-' + savedColorMode);
              } else {
                document.documentElement.classList.add('theme-default');
              }
            })()
          `}
        </Script>
      </head>
      <body className={inter.className + " min-h-screen flex flex-col"}>
        <Script id="show-banner" strategy="afterInteractive">
          {`
          const loader = document.getElementById('custom-loader');
          if (loader) {
            setTimeout(() => {
              loader.classList.add('opacity-0');
              setTimeout(() => {
                loader.style.display = 'none';
              }, 500);
            }, 1500);
          }
        `}
        </Script>
        
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <SettingsProvider>
              <MusicProvider>
                <PreferencesProvider>
                  <LibraryProvider>
                    <UserStatsProvider>
                      <SplashProvider>
                        <SidebarProvider>
                          <ClientLayout>{children}</ClientLayout>
                        </SidebarProvider>
                      </SplashProvider>
                    </UserStatsProvider>
                  </LibraryProvider>
                </PreferencesProvider>
              </MusicProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
