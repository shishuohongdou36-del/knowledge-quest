import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { useEffect } from 'react'

export function ModalRoot() {
  const { modal, closeModal } = useUIStore()

  useEffect(() => {
    if (!modal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal, closeModal])

  return (
    <AnimatePresence>
      {modal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="relative max-w-2xl w-[92vw] max-h-[88vh] overflow-auto rounded-xl bg-gray-900 ring-1 ring-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            {modal.content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
