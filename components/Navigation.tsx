"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { id: "hero", label: "Home" },
  { id: "fashion-single", label: "Mirror Crack'd" },
  { id: "fashion-compare", label: "Clash Tasteless" },
  { id: "profile-roast", label: "Digital Dossier" },
  { id: "typing-test", label: "Typo Terror" },
  { id: "battle-game", label: "Roast Gauntlet" },
  { id: "personality-quiz", label: "Demolition Quiz" },
]

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("hero")
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3 },
    )

    navItems.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light")
    document.body.className = isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
  }, [isDark])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isDark ? "bg-black/80" : "bg-white/80"
      } backdrop-blur-lg border-b border-purple-500/20`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold gradient-text">Roast Me Daddy</span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeSection === item.id
                    ? "bg-purple-500 text-white glow-effect"
                    : isDark
                      ? "text-gray-300 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="border-purple-500/30 hover:border-purple-500"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </nav>
  )
}
