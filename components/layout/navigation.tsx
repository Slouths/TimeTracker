'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

interface NavigationProps {
  user: {
    email?: string
  } | null
}

export function Navigation({ user }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/time-entries', label: 'Time Entries' },
    { href: '/projects', label: 'Projects' },
    { href: '/reports', label: 'Reports' },
    { href: '/invoices', label: 'Invoices' },
    { href: '/referrals', label: 'Referrals' },
    { href: '/help', label: 'Help' },
  ]

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-150"
            onClick={closeMobileMenu}
          >
            <span className="text-xl font-bold text-brand-charcoal">TradeTimer</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <Link
                  href="/profile"
                  className="text-sm text-gray-600 hover:text-accent-primary transition-colors duration-150 font-medium border-b-2 border-transparent"
                >
                  {user.email}
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors duration-150 border-b-2 ${
                      isActive(link.href)
                        ? 'text-accent-primary border-accent-primary font-semibold'
                        : 'text-gray-600 hover:text-accent-primary border-transparent'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="text-sm font-medium text-gray-600 hover:text-brand-charcoal transition-colors duration-150 border-b-2 border-transparent"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          {user && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-accent-primary hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/profile"
                className="text-sm text-gray-600 hover:text-accent-primary transition-colors font-medium px-2 py-1"
                onClick={closeMobileMenu}
              >
                {user.email}
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors px-2 py-1 ${
                    isActive(link.href)
                      ? 'text-accent-primary font-semibold bg-accent-primary/5'
                      : 'text-gray-600 hover:text-accent-primary'
                  }`}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
              <form action="/auth/signout" method="post" className="px-2">
                <button
                  type="submit"
                  className="text-sm font-medium text-gray-600 hover:text-brand-charcoal transition-colors text-left w-full py-1"
                  onClick={closeMobileMenu}
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
