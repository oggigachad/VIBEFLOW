"use client"

import * as React from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Simple cn utility function
const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
}

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

interface Toast extends ToastProps {
  id: string
}

type ToastContextType = {
  toast: (props: ToastProps) => void
  dismiss: (id: string) => void
  toasts: Toast[]
}

const ToastContext = React.createContext<ToastContextType>({
  toast: () => {},
  dismiss: () => {},
  toasts: []
})

export const Toaster = () => {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-0 right-0 z-50 w-full max-w-xs p-4 md:max-w-md">
      <AnimatePresence>
        {toasts.map(({ id, title, description, variant }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "mb-4 flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-md",
              variant === "destructive"
                ? "border-red-500/20 bg-red-500/10"
                : "border-purple-500/20 bg-black/90"
            )}
          >
            <div className="flex-1">
              {title && (
                <h3 className={cn(
                  "font-medium",
                  variant === "destructive" ? "text-red-400" : "text-foreground"
                )}>
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(id)}
              className={cn(
                "rounded-full p-1 transition-colors",
                variant === "destructive"
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-muted-foreground hover:bg-purple-500/10"
              )}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function ToastProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback(
    ({ title, description, variant = "default" }: ToastProps) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, title, description, variant }])

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        dismissToast(id)
      }, 5000)

      return id
    },
    []
  )

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast, dismiss: dismissToast, toasts }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  
  return {
    toast: context.toast,
    dismiss: context.dismiss,
    toasts: context.toasts
  }
}

export const toast = {
  default: (props: Omit<ToastProps, "variant">) => {
    const { toast } = useToast()
    return toast({ ...props, variant: "default" })
  },
  destructive: (props: Omit<ToastProps, "variant">) => {
    const { toast } = useToast()
    return toast({ ...props, variant: "destructive" })
  },
  dismiss: (id: string) => {
    const { dismiss } = useToast()
    return dismiss(id)
  },
} 