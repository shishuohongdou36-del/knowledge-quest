import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uiTuning } from '@/config/tuning'

// ============================================================
// Global UI shell state — Toast, Modal, ConfirmDialog, Theme
// Per design/gdd/ui-shell.md
// ============================================================

export type ToastKind = 'info' | 'success' | 'warning' | 'error'

export interface ToastItem {
  id: number
  kind: ToastKind
  message: string
  createdAt: number
}

export interface ModalState {
  id: string
  content: React.ReactNode
}

export interface ConfirmDialogState {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  destructive?: boolean
}

export type ThemeMode = 'dark' | 'light'

interface UIStore {
  toasts: ToastItem[]
  toastIdCounter: number
  modal: ModalState | null
  confirm: ConfirmDialogState | null
  theme: ThemeMode

  // Toast
  pushToast: (message: string, kind?: ToastKind) => void
  dismissToast: (id: number) => void

  // Modal
  openModal: (id: string, content: React.ReactNode) => void
  closeModal: () => void

  // Confirm dialog
  openConfirm: (state: ConfirmDialogState) => void
  closeConfirm: () => void

  // Theme
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      toasts: [],
      toastIdCounter: 0,
      modal: null,
      confirm: null,
      theme: 'dark',

      pushToast: (message, kind = 'info') => {
        set((state) => {
          const id = state.toastIdCounter
          let toasts = [...state.toasts, { id, kind, message, createdAt: Date.now() }]
          if (toasts.length > uiTuning.toastMaxStack) {
            toasts = toasts.slice(toasts.length - uiTuning.toastMaxStack)
          }
          return { toasts, toastIdCounter: id + 1 }
        })
        // Auto-dismiss
        const id = get().toastIdCounter - 1
        setTimeout(() => get().dismissToast(id), uiTuning.toastDurationMs)
      },

      dismissToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
      },

      openModal: (id, content) => set({ modal: { id, content } }),
      closeModal: () => set({ modal: null }),

      openConfirm: (state) => set({ confirm: state }),
      closeConfirm: () => set({ confirm: null }),

      setTheme: (theme) => {
        set({ theme })
        document.documentElement.dataset.theme = theme
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        get().setTheme(next)
      },
    }),
    {
      name: 'kq-ui',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)
