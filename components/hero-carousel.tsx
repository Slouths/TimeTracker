'use client'

import { useState, useEffect } from 'react'

const carouselImages = [
  {
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&auto=format&fit=crop&q=80',
    alt: 'Auto mechanic working on a vehicle',
  },
  {
    url: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1200&auto=format&fit=crop&q=80',
    alt: 'Professional car wash service',
  },
  {
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80',
    alt: 'Construction worker on job site',
  },
  {
    url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&auto=format&fit=crop&q=80',
    alt: 'Electrician working with tools',
  },
  {
    url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1200&auto=format&fit=crop&q=80',
    alt: 'Plumber fixing pipes',
  },
]

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length)
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl shadow-2xl overflow-hidden">
      {/* Images */}
      <div className="relative w-full h-full">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for better text visibility if needed */}
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
