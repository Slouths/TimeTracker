'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'font-sans',
          title: 'text-sm font-semibold',
          description: 'text-sm',
          actionButton: 'bg-accent-primary text-white',
          cancelButton: 'bg-slate-100 text-slate-800',
          closeButton: 'bg-white border-slate-200',
        },
      }}
    />
  )
}
