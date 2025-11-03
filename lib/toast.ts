import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
    })
  },

  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
    })
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
    })
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    })
  },
}

// Confirmation dialog using toast
export const confirm = (
  message: string,
  onConfirm: () => void | Promise<void>,
  onCancel?: () => void
) => {
  sonnerToast(message, {
    action: {
      label: 'Confirm',
      onClick: async () => {
        await onConfirm()
      },
    },
    cancel: {
      label: 'Cancel',
      onClick: () => {
        if (onCancel) onCancel()
      },
    },
    duration: 10000, // 10 seconds to make a decision
  })
}
