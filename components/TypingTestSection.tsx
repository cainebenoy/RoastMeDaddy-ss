"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { InvokeLLM } from "@/integrations/Core"
import { Timer, Keyboard, RotateCcw, Trophy, Save, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Typewriter from "./common/Typewriter"
import { RoastSessionAPI } from "@/lib/roast-session-api"

const insultTexts = [
  "Your typing skills are as impressive as a sloth on sedatives trying to break dance.",
  "The way you hunt and peck at keys suggests evolution might have skipped your family tree.",
  "Watching you type is like watching paint dry, but significantly more painful for everyone involved.",
  "Your keyboard must be filing a harassment complaint against your fingers by now.",
  "If typing were an Olympic sport, you'd still be warming the bench for the junior varsity team.",
  "Your WPM stands for 'Woefully Pathetic Mistakes' rather than words per minute.",
  "Even a caffeinated squirrel on a typewriter would produce more coherent results than this.",
]

const liveInsults = [
  "Seriously? My grandmother types faster with her eyes closed.",
  "Are you typing with your elbows? Because this is painful to watch.",
  "I've seen molasses move faster than your fingers.",
  "Did you learn to type from a tutorial written by sloths?",
  "Your keyboard is crying. Please show it some mercy.",
  "At this rate, we'll be here until the next ice age.",
  "Is this your first time seeing a keyboard?",
  "Even autocorrect has given up on you.",
  "Your typing speed suggests you're powered by a potato battery.",
]

export default function TypingTestSection() {
  const [currentText, setCurrentText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(15)
  const [isActive, setIsActive] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [liveInsult, setLiveInsult] = useState("")
  const [finalRoast, setFinalRoast] = useState("")
  const [isLoadingRoast, setIsLoadingRoast] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [correctChars, setCorrectChars] = useState(0)
  const [totalChars, setTotalChars] = useState(0)
  const [savedSessionId, setSavedSessionId] = useState(null)
  const inputRef = useRef(null)
  const intervalRef = useRef(null)
  const insultIntervalRef = useRef(null)

  useEffect(() => {
    // Select a random insult text when component mounts
    const randomText = insultTexts[Math.floor(Math.random() * insultTexts.length)]
    setCurrentText(randomText)
  }, [])

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      finishTest()
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, timeLeft])

  const startTest = () => {
    setIsActive(true)
    setIsComplete(false)
    setUserInput("")
    setTimeLeft(15)
    setWpm(0)
    setAccuracy(100)
    setCorrectChars(0)
    setTotalChars(0)
    setLiveInsult("")
    setFinalRoast("")
    setSavedSessionId(null)

    // Select new random text
    const randomText = insultTexts[Math.floor(Math.random() * insultTexts.length)]
    setCurrentText(randomText)

    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100)

    // Start live insults
    insultIntervalRef.current = setInterval(() => {
      const randomInsult = liveInsults[Math.floor(Math.random() * liveInsults.length)]
      setLiveInsult(randomInsult)
    }, 3000)
  }

  const finishTest = async () => {
    setIsActive(false)
    setIsComplete(true)

    if (insultIntervalRef.current) {
      clearInterval(insultIntervalRef.current)
    }

    // Calculate final stats
    const wordsTyped = userInput.trim().split(" ").length
    const finalWpm = Math.round((wordsTyped / 15) * 60)
    const finalAccuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0

    setWpm(finalWpm)
    setAccuracy(finalAccuracy)

    // Generate personalized roast
    setIsLoadingRoast(true)
    try {
      let performanceLevel = ""
      if (finalWpm < 20) performanceLevel = "embarrassingly slow"
      else if (finalWpm < 40) performanceLevel = "painfully average"
      else if (finalWpm < 60) performanceLevel = "decent but unremarkable"
      else performanceLevel = "surprisingly competent"

      const roastPrompt = `Generate a unique, savage, and witty roast about someone's typing performance. They typed at ${finalWpm} WPM with ${finalAccuracy}% accuracy in 15 seconds. Their performance was ${performanceLevel}. Be brutally honest but humorous. Make it personal and cutting. 2-3 sentences maximum. Don't repeat previous roasts.`

      const response = await InvokeLLM({ prompt: roastPrompt })
      setFinalRoast(response)

      // Auto-save the typing test session
      try {
        const session = await RoastSessionAPI.createRoastSession({
          section_type: "typing_test",
          input_data: {
            text_to_type: currentText,
            user_input: userInput,
            test_duration: 15,
          },
          roast_result: response,
          performance_metrics: {
            wpm: finalWpm,
            accuracy: finalAccuracy,
            correct_chars: correctChars,
            total_chars: totalChars,
          },
        })
        setSavedSessionId(session.id)
      } catch (saveError) {
        console.error("Failed to save typing test session:", saveError)
      }
    } catch (error) {
      const errorRoast = "Your typing is so bad, even our roast generator crashed trying to find words harsh enough."
      setFinalRoast(errorRoast)

      // Save error roast too
      try {
        await RoastSessionAPI.createRoastSession({
          section_type: "typing_test",
          input_data: { error: true, user_input: userInput },
          roast_result: errorRoast,
          performance_metrics: { wpm: finalWpm, accuracy: finalAccuracy },
        })
      } catch (saveError) {
        console.error("Failed to save error typing test session:", saveError)
      }
    }
    setIsLoadingRoast(false)
  }

  const resetTest = () => {
    setIsActive(false)
    setIsComplete(false)
    setUserInput("")
    setTimeLeft(15)
    setWpm(0)
    setAccuracy(100)
    setCorrectChars(0)
    setTotalChars(0)
    setLiveInsult("")
    setFinalRoast("")
    setSavedSessionId(null)

    if (intervalRef.current) clearInterval(intervalRef.current)
    if (insultIntervalRef.current) clearInterval(insultIntervalRef.current)

    // Select new random text
    const randomText = insultTexts[Math.floor(Math.random() * insultTexts.length)]
    setCurrentText(randomText)
  }

  const saveTypingSession = async () => {
    if (!finalRoast) return

    setIsSaving(true)
    try {
      const session = await RoastSessionAPI.createRoastSession({
        section_type: "typing_test",
        input_data: {
          text_to_type: currentText,
          user_input: userInput,
          test_duration: 15,
          manual_save: true,
        },
        roast_result: finalRoast,
        performance_metrics: {
          wpm: wpm,
          accuracy: accuracy,
          correct_chars: correctChars,
          total_chars: totalChars,
        },
      })
      setSavedSessionId(session.id)
    } catch (error) {
      console.error("Failed to save typing session:", error)
    }
    setIsSaving(false)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setUserInput(value)

    // Calculate accuracy in real-time
    let correct = 0
    const total = value.length

    for (let i = 0; i < value.length && i < currentText.length; i++) {
      if (value[i] === currentText[i]) {
        correct++
      }
    }

    setCorrectChars(correct)
    setTotalChars(total)

    if (total > 0) {
      setAccuracy(Math.round((correct / total) * 100))
    }

    // Calculate WPM in real-time
    const wordsTyped = value.trim().split(" ").length
    const timeElapsed = 15 - timeLeft
    if (timeElapsed > 0) {
      const currentWpm = Math.round((wordsTyped / timeElapsed) * 60)
      setWpm(currentWpm)
    }
  }

  const renderText = () => {
    return currentText.split("").map((char, index) => {
      let className = "text-secondary"

      if (index < userInput.length) {
        className = userInput[index] === char ? "text-green-400 bg-green-400/20" : "text-red-400 bg-red-400/20"
      } else if (index === userInput.length) {
        className = "text-primary bg-purple-500/30 animate-pulse"
      }

      return (
        <span key={index} className={`${className} transition-all duration-200`}>
          {char}
        </span>
      )
    })
  }

  return (
    <section id="typing-test" className="min-h-screen flex items-center py-20 section-scroll">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-black mb-6 text-primary"
          >
            <span className="gradient-text">Typo Terror</span>
            <br />
            Test
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-secondary mb-12"
          >
            Type the insult. Get insulted. It's a lose-lose situation.
          </motion.p>

          <div className="space-y-6">
            {/* Stats Bar */}
            <Card className="bg-secondary border-themed">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <Timer className="w-5 h-5 text-purple-400 mr-2" />
                      <span className="text-2xl font-bold text-primary">{timeLeft}s</span>
                    </div>
                    <p className="text-secondary text-sm">Time Left</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <Keyboard className="w-5 h-5 text-blue-400 mr-2" />
                      <span className="text-2xl font-bold text-primary">{wpm}</span>
                    </div>
                    <p className="text-secondary text-sm">WPM</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-2xl font-bold text-primary">{accuracy}%</span>
                    </div>
                    <p className="text-secondary text-sm">Accuracy</p>
                  </div>
                </div>

                {isActive && (
                  <div className="mt-4">
                    <Progress value={((15 - timeLeft) / 15) * 100} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Typing Area */}
            <Card className="bg-secondary border-themed">
              <CardContent className="p-8">
                <div className="mb-6">
                  <p className="text-lg leading-relaxed font-mono">{renderText()}</p>
                </div>

                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={handleInputChange}
                  disabled={!isActive || isComplete}
                  placeholder={isActive ? "Start typing..." : "Click 'Start Test' to begin"}
                  className="w-full h-32 p-4 bg-primary border-themed rounded-lg resize-none text-primary font-mono text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <div className="flex justify-center gap-4 mt-6">
                  {!isActive && !isComplete && (
                    <Button onClick={startTest} className="bg-purple-500 hover:bg-purple-600 px-8 py-3">
                      <Timer className="w-4 h-4 mr-2" />
                      Start Test
                    </Button>
                  )}

                  {(isActive || isComplete) && (
                    <Button
                      onClick={resetTest}
                      variant="outline"
                      className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-8 py-3 bg-transparent"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Test
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Live Insults */}
            <AnimatePresence>
              {isActive && liveInsult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-red-500/10 border-red-500/30">
                    <CardContent className="p-4">
                      <p className="text-red-400 text-center italic">"{liveInsult}"</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Final Results */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-secondary border-themed">
                    <CardContent className="p-8">
                      <h3 className="text-3xl font-bold mb-6 text-purple-400">Your Pathetic Results</h3>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-primary mb-2">{wpm}</div>
                          <p className="text-secondary">Words Per Minute</p>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-primary mb-2">{accuracy}%</div>
                          <p className="text-secondary">Accuracy</p>
                        </div>
                      </div>

                      {isLoadingRoast ? (
                        <div className="text-center">
                          <p className="text-secondary">Crafting your personalized insult...</p>
                        </div>
                      ) : finalRoast ? (
                        <div className="bg-primary p-6 rounded-lg border-themed">
                          <h4 className="text-xl font-bold mb-4 text-purple-400">Your Performance Roast</h4>
                          <Typewriter text={finalRoast} className="text-lg text-primary leading-relaxed mb-6" />

                          <div className="flex justify-center gap-4">
                            {!savedSessionId && (
                              <Button
                                onClick={saveTypingSession}
                                disabled={isSaving}
                                variant="outline"
                                className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-transparent"
                              >
                                {isSaving ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Results
                                  </>
                                )}
                              </Button>
                            )}
                            {savedSessionId && (
                              <div className="text-sm text-green-400 flex items-center">
                                ✓ Results saved to your collection
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
