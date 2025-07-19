"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RoastSessionAPI, type RoastSession } from "@/lib/roast-session-api"
import { History, Loader2, RefreshCw, Filter, Calendar, ImageIcon, Github, Keyboard, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const sectionTypeLabels = {
  fashion_single: "Fashion Single",
  fashion_comparison: "Fashion Battle",
  profile_roast: "Profile Roast",
  typing_test: "Typing Test",
  battle_game: "Roast Gauntlet",
  personality_quiz: "Personality Quiz",
}

const sectionTypeIcons = {
  fashion_single: ImageIcon,
  fashion_comparison: ImageIcon,
  profile_roast: Github,
  typing_test: Keyboard,
  battle_game: Zap,
  personality_quiz: History,
}

const sectionTypeColors = {
  fashion_single: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  fashion_comparison: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  profile_roast: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  typing_test: "bg-green-500/20 text-green-400 border-green-500/30",
  battle_game: "bg-red-500/20 text-red-400 border-red-500/30",
  personality_quiz: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
}

export default function RoastHistorySection() {
  const [roastSessions, setRoastSessions] = useState<RoastSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadRoastSessions = async () => {
    setIsLoading(true)
    try {
      const sessions = await RoastSessionAPI.getRecentRoasts(50)
      setRoastSessions(sessions)
    } catch (error) {
      console.error("Failed to load roast sessions:", error)
    }
    setIsLoading(false)
  }

  const refreshSessions = async () => {
    setIsRefreshing(true)
    await loadRoastSessions()
    setIsRefreshing(false)
  }

  useEffect(() => {
    loadRoastSessions()
  }, [])

  const filteredSessions = roastSessions.filter(
    (session) => selectedFilter === "all" || session.section_type === selectedFilter,
  )

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPerformanceMetrics = (session: RoastSession) => {
    if (session.section_type === "typing_test" && session.performance_metrics) {
      return (
        <div className="flex gap-4 text-sm text-secondary">
          <span>{session.performance_metrics.wpm} WPM</span>
          <span>{session.performance_metrics.accuracy}% Accuracy</span>
        </div>
      )
    } else if (session.section_type === "battle_game" && session.performance_metrics) {
      return (
        <div className="flex gap-4 text-sm text-secondary">
          <span>Level {session.performance_metrics.escalation_level}</span>
          <span>{session.performance_metrics.brutality_score}% Brutality</span>
          <span>{session.performance_metrics.messages_exchanged} Messages</span>
        </div>
      )
    }
    return null
  }

  const getInputSummary = (session: RoastSession) => {
    if (!session.input_data) return null

    switch (session.section_type) {
      case "fashion_single":
        return session.input_data.file_name ? `Image: ${session.input_data.file_name}` : "Fashion image"
      case "fashion_comparison":
        return "Fashion comparison"
      case "profile_roast":
        return `${session.input_data.platform}: ${session.input_data.profile_url}`
      case "typing_test":
        return `Typing test (${session.input_data.test_duration}s)`
      case "battle_game":
        return `Battle: "${session.input_data.user_message}" (Level ${session.input_data.escalation_level})`
      default:
        return null
    }
  }

  const uniqueSectionTypes = [...new Set(roastSessions.map((s) => s.section_type))]

  return (
    <section id="roast-history" className="min-h-screen flex items-center py-20 section-scroll">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-primary">
              <span className="gradient-text">Hall of</span>
              <br />
              Shame
            </h2>
            <p className="text-xl text-secondary mb-8">Your complete collection of digital destruction</p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button
                onClick={() => setSelectedFilter("all")}
                variant={selectedFilter === "all" ? "default" : "outline"}
                className={selectedFilter === "all" ? "bg-purple-500 hover:bg-purple-600" : "border-purple-500/30"}
              >
                <Filter className="w-4 h-4 mr-2" />
                All ({roastSessions.length})
              </Button>

              {uniqueSectionTypes.map((type) => {
                const count = roastSessions.filter((s) => s.section_type === type).length
                const Icon = sectionTypeIcons[type] || History

                return (
                  <Button
                    key={type}
                    onClick={() => setSelectedFilter(type)}
                    variant={selectedFilter === type ? "default" : "outline"}
                    className={selectedFilter === type ? "bg-purple-500 hover:bg-purple-600" : "border-purple-500/30"}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {sectionTypeLabels[type]} ({count})
                  </Button>
                )
              })}

              <Button
                onClick={refreshSessions}
                disabled={isRefreshing}
                variant="outline"
                className="border-purple-500/30 bg-transparent"
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
              <p className="text-secondary">Loading your shameful history...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <Card className="bg-secondary border-themed">
              <CardContent className="p-12 text-center">
                <History className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2 text-primary">No Roasts Found</h3>
                <p className="text-secondary">
                  {selectedFilter === "all"
                    ? "Start getting roasted to build your collection of shame!"
                    : `No ${sectionTypeLabels[selectedFilter]} sessions found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              <AnimatePresence>
                {filteredSessions.map((session, index) => {
                  const Icon = sectionTypeIcons[session.section_type] || History

                  return (
                    <motion.div
                      key={session.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="bg-secondary border-themed hover:border-purple-500/40 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Icon className="w-6 h-6 text-purple-400" />
                              <div>
                                <Badge className={sectionTypeColors[session.section_type]}>
                                  {sectionTypeLabels[session.section_type]}
                                </Badge>
                                <div className="flex items-center gap-2 mt-1 text-sm text-secondary">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(session.created_at)}
                                </div>
                              </div>
                            </div>

                            {getPerformanceMetrics(session)}
                          </div>

                          {getInputSummary(session) && (
                            <div className="mb-3 text-sm text-secondary">{getInputSummary(session)}</div>
                          )}

                          <div className="bg-primary p-4 rounded-lg border-themed">
                            <p className="text-primary leading-relaxed">{session.roast_result}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
