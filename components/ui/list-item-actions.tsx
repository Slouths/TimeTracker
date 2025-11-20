'use client'

import { useState, useRef, useEffect } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

interface ListItemActionsProps {
  onEdit: () => void
  onDelete: () => void
  editLabel?: string
  deleteLabel?: string
}

export function ListItemActions({
  onEdit,
  onDelete,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
}: ListItemActionsProps) {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance

    if (isLeftSwipe) {
      setIsSwipeOpen(true)
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(10)
      }
    } else {
      setIsSwipeOpen(false)
    }
  }

  // Close swipe on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSwipeOpen(false)
      }
    }

    if (isSwipeOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSwipeOpen])

  return (
    <>
      {/* Desktop View - Always Visible Icon Buttons */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          onClick={onEdit}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label={editLabel}
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          aria-label={deleteLabel}
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile View - Swipeable Actions */}
      <div
        ref={containerRef}
        className="sm:hidden relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Swipe Indicator (visible when not swiped) */}
        {!isSwipeOpen && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSwipeOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
              aria-label="Show actions"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Action Buttons (visible when swiped or tapped) */}
        {isSwipeOpen && (
          <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-200">
            <button
              onClick={() => {
                onEdit()
                setIsSwipeOpen(false)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center gap-2"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <Pencil className="h-4 w-4" />
              <span>{editLabel}</span>
            </button>
            <button
              onClick={() => {
                onDelete()
                setIsSwipeOpen(false)
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 flex items-center gap-2"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <Trash2 className="h-4 w-4" />
              <span>{deleteLabel}</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
