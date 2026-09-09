import { useEffect, useState } from 'react'

interface NavigationProps {
  currentPath: string
}

export default function Navigation({ currentPath }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isCurrentPage = (path: string) => currentPath === path

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-sm shadow-md' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          <a href="/">Astro App</a>
        </div>
        <ul className="flex gap-6 items-center">
          <li>
            <a
              href="/"
              className={`transition-colors duration-200 hover:text-purple-600 ${isCurrentPage('/') ? 'text-purple-600 font-semibold' : 'text-gray-700'}`}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="/about"
              className={`transition-colors duration-200 hover:text-purple-600 ${isCurrentPage('/about') ? 'text-purple-600 font-semibold' : 'text-gray-700'}`}
            >
              About
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
