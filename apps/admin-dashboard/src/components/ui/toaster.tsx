"use client"

import { Check, X, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning" | "info"
  duration?: number
}

interface ToasterProps {
  toasts?: Toast[]
}

const toastVariants = {
  default: {
    icon: null,
    className: "bg-background border",
  },
  success: {
    icon: Check,
    className: "bg-green-50 border-green-200 text-green-900",
  },
  error: {
    icon: X,
    className: "bg-red-50 border-red-200 text-red-900",
  },
  warning: {
    icon: AlertCircle,
    className: "bg-yellow-50 border-yellow-200 text-yellow-900",
  },
  info: {
    icon: Info,
    className: "bg-blue-50 border-blue-200 text-blue-900",
  },
}

export function Toaster({ toasts = [] }: ToasterProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 m-4 flex max-w-md flex-col gap-2">
      {toasts.map((toast) => {
        const variant = toastVariants[toast.variant || "default"]
        const Icon = variant.icon

        return (
          <div
            key={toast.id}
            className={cn(
              "rounded-lg border p-4 shadow-lg transition-all",
              variant.className
            )}
          >
            <div className="flex items-start gap-3">
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
              <div className="flex-1">
                {toast.title && (
                  <h3 className="font-semibold">{toast.title}</h3>
                )}
                {toast.description && (
                  <p className="mt-1 text-sm opacity-90">{toast.description}</p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}