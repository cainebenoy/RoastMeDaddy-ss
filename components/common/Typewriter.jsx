"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function Typewriter({ text, className }) {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    setDisplayedText("")
    let i = 0
    const intervalId = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(intervalId)
      }
    }, 20) // Adjust speed here

    return () => clearInterval(intervalId)
  }, [text])

  return (
    <motion.p className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {displayedText}
      <span className="inline-block w-2 h-5 bg-purple-500 animate-pulse ml-1" />
    </motion.p>
  )
}
