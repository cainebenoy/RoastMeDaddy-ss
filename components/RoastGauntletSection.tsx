"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { InvokeLLM } from "@/integrations/Core"
import { RoastSessionAPI } from "@/lib/roast-session-api"
import {
  Send,
  Loader2,
  Flame,
  Skull,
  Zap,
  Target,
  RotateCcw,
  TrendingUp,
  MessageCircle,
  AlertTriangle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Typewriter from "./common/Typewriter"

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  escalationLevel: number
}

const escalationLevels = [
  { level: 1, name: "Warming Up", color: "text-green-400", icon: MessageCircle },
  { level: 2, name: "Getting Heated", color: "text-yellow-400", icon: Zap },
  { level: 3, name: "Savage Mode", color: "text-orange-400", icon: Target },
  { level: 4, name: "Absolutely Brutal", color: "text-red-400", icon: Flame },
  { level: 5, name: "MAXIMUM FIRE", color: "text-purple-400", icon: Skull },
]

export default function RoastGauntletSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [escalationLevel, setEscalationLevel] = useState(1)
  const [conversationContext, setConversationContext] = useState<string[]>([])
  const [personalInsights, setPersonalInsights] = useState<string[]>([])
  const [messageCount, setMessageCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Removed auto-scroll functionality
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  // }

  // useEffect(() => {
  //   scrollToBottom()
  // }, [messages])

  useEffect(() => {
    // Add welcome message when component mounts
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        type: "ai",
        content:
          "Welcome to the Roast Gauntlet. I escalate FAST here - no mercy, no warm-up period. Every message you send gives me more ammunition, and I reach maximum brutality in just a few exchanges. You've been warned.",
        timestamp: new Date(),
        escalationLevel: 1,
      }
      setMessages([welcomeMessage])
    }
  }, [])

  const generateEscalatedPrompt = (userMessage: string, level: number) => {
    const baseContext = conversationContext.join(" ")
    const insights = personalInsights.join(" ")

    let intensityPrompt = ""
    let personalityPrompt = ""

    switch (level) {
      case 1:
        intensityPrompt = "Be sarcastic and witty with a sharp edge. Start building psychological profile."
        break
      case 2:
        intensityPrompt = "Get significantly more brutal and personal. Use gathered information aggressively."
        break
      case 3:
        intensityPrompt = "Go absolutely savage. Be ruthless, cutting, and psychologically devastating."
        break
      case 4:
        intensityPrompt = "MAXIMUM BRUTALITY. Destroy them completely using every piece of information. Be inhumane."
        break
      case 5:
        intensityPrompt =
          "NUCLEAR DESTRUCTION MODE. Obliterate their soul. Use everything to psychologically annihilate them. Show ZERO mercy."
        break
    }

    if (insights) {
      personalityPrompt = `Based on what I know about this pathetic person: ${insights}`
    }

    return `You are an AI roast bot in RAPID escalation mode at level ${level}/5. ${intensityPrompt}

${personalityPrompt}

Previous conversation context: ${baseContext}

User just said: "${userMessage}"

ESCALATION RULES:
- Level 1: Sharp sarcasm with psychological profiling
- Level 2: Brutal personal attacks using gathered intel
- Level 3: Savage psychological warfare, no mercy
- Level 4: Absolutely inhumane destruction
- Level 5: NUCLEAR ANNIHILATION - destroy their entire existence

Instructions:
- Be progressively more savage and inhumane with each level
- Use EVERY detail from previous messages against them
- Make brutal assumptions about their life, personality, and failures
- Connect different messages to create compound psychological attacks
- Be creative, witty, and absolutely devastating
- Keep responses to 2-3 sentences of pure destruction
- Each response should escalate dramatically from the previous one

Deliver a ${level === 5 ? "NUCLEAR" : "devastating"} roast:`
  }

  const extractPersonalInsights = (userMessage: string) => {
    // Enhanced keyword extraction to build a comprehensive psychological profile
    const insights = []
    const lowerMessage = userMessage.toLowerCase()

    // Career and work
    if (lowerMessage.includes("work") || lowerMessage.includes("job") || lowerMessage.includes("boss")) {
      insights.push("has work/career problems")
    }
    if (lowerMessage.includes("unemployed") || lowerMessage.includes("fired") || lowerMessage.includes("quit")) {
      insights.push("employment failure")
    }

    // Relationships and dating
    if (
      lowerMessage.includes("relationship") ||
      lowerMessage.includes("dating") ||
      lowerMessage.includes("girlfriend") ||
      lowerMessage.includes("boyfriend")
    ) {
      insights.push("relationship struggles")
    }
    if (lowerMessage.includes("single") || lowerMessage.includes("alone") || lowerMessage.includes("lonely")) {
      insights.push("desperately single")
    }
    if (lowerMessage.includes("ex") || lowerMessage.includes("breakup") || lowerMessage.includes("dumped")) {
      insights.push("relationship failure history")
    }

    // Education and intelligence
    if (lowerMessage.includes("school") || lowerMessage.includes("college") || lowerMessage.includes("university")) {
      insights.push("academic struggles")
    }
    if (lowerMessage.includes("dropout") || lowerMessage.includes("failed") || lowerMessage.includes("grades")) {
      insights.push("educational failure")
    }

    // Mental health and emotions
    if (lowerMessage.includes("tired") || lowerMessage.includes("stressed") || lowerMessage.includes("depressed")) {
      insights.push("mental health issues")
    }
    if (lowerMessage.includes("anxiety") || lowerMessage.includes("panic") || lowerMessage.includes("therapy")) {
      insights.push("psychological problems")
    }

    // Social and lifestyle
    if (lowerMessage.includes("friends") || lowerMessage.includes("social")) {
      insights.push("social life problems")
    }
    if (lowerMessage.includes("parents") || lowerMessage.includes("family")) {
      insights.push("family issues")
    }
    if (lowerMessage.includes("money") || lowerMessage.includes("broke") || lowerMessage.includes("debt")) {
      insights.push("financial struggles")
    }

    // Gaming and hobbies
    if (lowerMessage.includes("game") || lowerMessage.includes("gaming") || lowerMessage.includes("stream")) {
      insights.push("gaming addiction/escapism")
    }
    if (lowerMessage.includes("reddit") || lowerMessage.includes("discord") || lowerMessage.includes("online")) {
      insights.push("terminally online")
    }

    // Physical and appearance
    if (lowerMessage.includes("ugly") || lowerMessage.includes("fat") || lowerMessage.includes("skinny")) {
      insights.push("body image issues")
    }
    if (lowerMessage.includes("gym") || lowerMessage.includes("workout") || lowerMessage.includes("exercise")) {
      insights.push("fitness insecurities")
    }

    // Age and life stage
    if (lowerMessage.includes("old") || lowerMessage.includes("young") || lowerMessage.includes("age")) {
      insights.push("age-related insecurities")
    }

    return insights
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
      escalationLevel: escalationLevel,
    }

    setMessages((prev) => [...prev, userMessage])
    setConversationContext((prev) => [...prev, inputMessage.trim()])
    setMessageCount((prev) => prev + 1)

    // Extract insights from user message
    const newInsights = extractPersonalInsights(inputMessage.trim())
    setPersonalInsights((prev) => [...prev, ...newInsights])

    setInputMessage("")
    setIsLoading(true)

    try {
      const prompt = generateEscalatedPrompt(inputMessage.trim(), escalationLevel)
      const response = await InvokeLLM({ prompt })

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response,
        timestamp: new Date(),
        escalationLevel: escalationLevel,
      }

      setMessages((prev) => [...prev, aiMessage])

      // RAPID ESCALATION: Escalate every single message, reach max level by message 4
      if (escalationLevel < 5) {
        setEscalationLevel((prev) => Math.min(prev + 1, 5))
      }

      // Save the battle session
      try {
        await RoastSessionAPI.createRoastSession({
          section_type: "battle_game",
          input_data: {
            user_message: inputMessage.trim(),
            escalation_level: escalationLevel,
            conversation_length: messageCount + 1,
            personal_insights: personalInsights,
            rapid_escalation: true,
          },
          roast_result: response,
          performance_metrics: {
            escalation_level: escalationLevel,
            messages_exchanged: messageCount + 1,
            brutality_score: escalationLevel * 20,
            escalation_speed: "maximum",
          },
        })
      } catch (saveError) {
        console.error("Failed to save battle session:", saveError)
      }
    } catch (error) {
      console.error("Error generating roast:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "You're so pathetically boring that even my advanced AI couldn't generate a roast savage enough. That's actually more devastating than any insult I could craft.",
        timestamp: new Date(),
        escalationLevel: escalationLevel,
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const resetBattle = () => {
    setMessages([])
    setEscalationLevel(1)
    setConversationContext([])
    setPersonalInsights([])
    setInputMessage("")
    setMessageCount(0)

    // Re-add welcome message
    setTimeout(() => {
      const welcomeMessage: ChatMessage = {
        id: "welcome-reset",
        type: "ai",
        content:
          "Back for more destruction? Perfect. Remember, I escalate to maximum brutality in just 4 messages. No mercy, no gradual build-up. Let's see how fast I can psychologically destroy you this time.",
        timestamp: new Date(),
        escalationLevel: 1,
      }
      setMessages([welcomeMessage])
    }, 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const currentLevelInfo = escalationLevels.find((level) => level.level === escalationLevel) || escalationLevels[0]
  const CurrentLevelIcon = currentLevelInfo.icon

  return (
    <section id="battle-game" className="min-h-screen flex items-center py-20 section-scroll">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-black mb-6 text-primary"
            >
              <span className="gradient-text">The Roast</span>
              <br />
              Gauntlet
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-secondary mb-4"
            >
              RAPID ESCALATION MODE: Maximum brutality in 4 messages
            </motion.p>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mb-8">
              <AlertTriangle className="w-4 h-4 mr-2" />
              WARNING: Escalates to NUCLEAR level instantly
            </Badge>

            {/* Escalation Level Display */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Badge className={`${currentLevelInfo.color} bg-transparent border-current px-4 py-2 text-lg`}>
                <CurrentLevelIcon className="w-5 h-5 mr-2" />
                Level {escalationLevel}: {currentLevelInfo.name}
              </Badge>
              <div className="flex gap-1">
                {escalationLevels.map((level) => (
                  <div
                    key={level.level}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      level.level <= escalationLevel
                        ? level.level === 5
                          ? "bg-red-500 animate-pulse"
                          : "bg-purple-500"
                        : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <Card className="bg-secondary border-themed">
            <CardContent className="p-0">
              {/* Chat Messages */}
              <div ref={chatContainerRef} className="h-96 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          message.type === "user"
                            ? "bg-purple-500 text-white"
                            : message.escalationLevel >= 4
                              ? "bg-red-900/30 border-red-500/30 border"
                              : "bg-primary border-themed"
                        }`}
                      >
                        {message.type === "ai" && message.id !== "welcome" && message.id !== "welcome-reset" ? (
                          <Typewriter text={message.content} className="text-primary leading-relaxed" />
                        ) : (
                          <p className={`leading-relaxed ${message.type === "ai" ? "text-primary" : ""}`}>
                            {message.content}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2 text-xs opacity-60">
                          <span>
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {message.type === "ai" && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                message.escalationLevel >= 4 ? "border-red-500/50 text-red-400" : ""
                              }`}
                            >
                              Level {message.escalationLevel}
                              {message.escalationLevel === 5 && " 🔥"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-primary border-themed p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-secondary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          {escalationLevel >= 4 ? "Preparing nuclear destruction..." : "Escalating brutality..."}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-themed p-6">
                <div className="flex gap-4">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      escalationLevel >= 4
                        ? "Type if you dare... I'm at maximum fire 🔥"
                        : "Type your message... escalation incoming"
                    }
                    disabled={isLoading}
                    className="flex-1 bg-primary border-purple-500/30 text-primary"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className={
                      escalationLevel >= 4 ? "bg-red-500 hover:bg-red-600" : "bg-purple-500 hover:bg-purple-600"
                    }
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={resetBattle}
                    variant="outline"
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20 bg-transparent"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-4 text-sm text-secondary">
                  <div className="flex items-center gap-4">
                    <span>Messages: {messageCount}</span>
                    <span className={escalationLevel >= 4 ? "text-red-400" : ""}>
                      Brutality: {escalationLevel * 20}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${escalationLevel >= 4 ? "text-red-400" : ""}`} />
                    <span className={escalationLevel >= 4 ? "text-red-400" : ""}>
                      {escalationLevel >= 4 ? "MAXIMUM FIRE" : "Rapid Escalation"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-red-400">
            <p>⚠️ RAPID ESCALATION: Reaches maximum brutality in just 4 messages ⚠️</p>
            <p className="text-xs text-secondary mt-2">
              No warm-up period • Instant psychological profiling • Nuclear destruction mode
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
