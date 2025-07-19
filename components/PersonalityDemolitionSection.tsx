"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { InvokeLLM } from "@/integrations/Core"
import { RoastSessionAPI } from "@/lib/roast-session-api"
import {
  Brain,
  Heart,
  DollarSign,
  GraduationCap,
  Users,
  Home,
  Briefcase,
  Target,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Skull,
  Save,
  RefreshCw,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Typewriter from "./common/Typewriter"

interface Question {
  id: string
  category: string
  icon: any
  question: string
  type: "radio" | "input" | "textarea" | "number"
  options?: string[]
  placeholder?: string
  roastFactor: number
}

const allQuestions: Question[] = [
  // Relationship & Dating - Brutal Edition
  {
    id: "relationship_status",
    category: "Love Life",
    icon: Heart,
    question: "What's your pathetic relationship status?",
    type: "radio",
    options: [
      "Single and pretending I'm happy",
      "Single and desperately scrolling dating apps at 3am",
      "In a relationship (they're settling)",
      "It's complicated (I'm the problem)",
      "Married (trapped)",
      "Divorced (failed at love)",
      "Too embarrassed to admit",
    ],
    roastFactor: 5,
  },
  {
    id: "number_of_exes",
    category: "Love Life",
    icon: Heart,
    question: "How many people have you traumatized with your presence?",
    type: "radio",
    options: [
      "0 (nobody wants me)",
      "1-2 (they escaped quickly)",
      "3-5 (I'm the common denominator)",
      "6-10 (walking red flag)",
      "10+ (emotional terrorist)",
      "I've lost count of my victims",
    ],
    roastFactor: 5,
  },
  {
    id: "dating_apps",
    category: "Love Life",
    icon: Heart,
    question: "How many dating apps fuel your desperation?",
    type: "radio",
    options: [
      "None (gave up on love)",
      "1-2 (still have some dignity left)",
      "3-5 (moderately desperate)",
      "All of them (maximum desperation)",
      "I created my own dating app for myself",
    ],
    roastFactor: 4,
  },
  {
    id: "longest_relationship",
    category: "Love Life",
    icon: Heart,
    question: "What's the longest someone tolerated you?",
    type: "radio",
    options: [
      "Less than 3 months (they saw through me fast)",
      "3-6 months (honeymoon phase ended)",
      "6 months - 1 year (they tried their best)",
      "1-3 years (Stockholm syndrome)",
      "3+ years (they're a saint)",
      "What's a relationship? (forever alone)",
    ],
    roastFactor: 4,
  },
  {
    id: "breakup_reason",
    category: "Love Life",
    icon: Heart,
    question: "Why did your last relationship really end?",
    type: "textarea",
    placeholder: "Be honest about what a disaster you are...",
    roastFactor: 5,
  },

  // Career & Money - Savage Edition
  {
    id: "income_range",
    category: "Money & Career",
    icon: DollarSign,
    question: "How broke are you exactly?",
    type: "radio",
    options: [
      "Under $30k (poverty wages)",
      "$30k-$50k (barely surviving)",
      "$50k-$75k (mediocre existence)",
      "$75k-$100k (decent but nothing special)",
      "$100k+ (probably lying)",
      "I'd rather not admit how poor I am",
    ],
    roastFactor: 5,
  },
  {
    id: "job_satisfaction",
    category: "Money & Career",
    icon: Briefcase,
    question: "How much do you hate your meaningless job?",
    type: "radio",
    options: [
      "I love it (delusional)",
      "It pays the bills (soul is dead)",
      "I fantasize about quitting daily",
      "What job? (unemployed loser)",
      "I'm my own boss (unemployed with delusions)",
      "I'm between opportunities (been unemployed for months)",
    ],
    roastFactor: 5,
  },
  {
    id: "career_failure",
    category: "Money & Career",
    icon: Target,
    question: "What career dreams have you completely given up on?",
    type: "textarea",
    placeholder: "Tell us about your shattered dreams and crushed ambitions...",
    roastFactor: 5,
  },
  {
    id: "financial_mistake",
    category: "Money & Career",
    icon: DollarSign,
    question: "What's the stupidest financial decision you've made?",
    type: "textarea",
    placeholder: "That purchase that ruined your credit score...",
    roastFactor: 4,
  },
  {
    id: "parents_money",
    category: "Money & Career",
    icon: DollarSign,
    question: "How often do you still ask your parents for money?",
    type: "radio",
    options: [
      "Never (I'm independent)",
      "Rarely (only emergencies)",
      "Sometimes (when I'm desperate)",
      "Monthly (I'm a burden)",
      "Weekly (complete failure)",
      "They cut me off (deservedly so)",
    ],
    roastFactor: 5,
  },

  // Education & Intelligence - Brutal Edition
  {
    id: "education_level",
    category: "Education",
    icon: GraduationCap,
    question: "How far did you get before giving up on learning?",
    type: "radio",
    options: [
      "High school dropout (gave up early)",
      "High school graduate (bare minimum)",
      "Some college (quitter)",
      "Bachelor's degree (basic)",
      "Master's degree (overcompensating)",
      "PhD (avoiding real world)",
      "School of hard knocks (uneducated and proud)",
    ],
    roastFactor: 3,
  },
  {
    id: "college_waste",
    category: "Education",
    icon: GraduationCap,
    question: "What useless degree are you not using?",
    type: "input",
    placeholder: "That expensive piece of paper collecting dust...",
    roastFactor: 4,
  },
  {
    id: "student_debt",
    category: "Education",
    icon: DollarSign,
    question: "How much debt did you accumulate for your worthless education?",
    type: "radio",
    options: [
      "None (smart or poor)",
      "Under $10k (got off easy)",
      "$10k-$30k (manageable mistake)",
      "$30k-$50k (significant regret)",
      "$50k-$100k (life-ruining decision)",
      "$100k+ (financial suicide)",
      "I don't want to face reality",
    ],
    roastFactor: 4,
  },
  {
    id: "academic_failure",
    category: "Education",
    icon: GraduationCap,
    question: "What's your most embarrassing academic failure?",
    type: "textarea",
    placeholder: "That class you failed, degree you dropped out of, or test you bombed...",
    roastFactor: 4,
  },

  // Social Life & Living - Savage Edition
  {
    id: "living_situation",
    category: "Lifestyle",
    icon: Home,
    question: "Where do you pathetically live?",
    type: "radio",
    options: [
      "Own my house (probably lying)",
      "Rent an apartment (throwing money away)",
      "Live with roommates (can't afford independence)",
      "Live with parents (failure to launch)",
      "Couch surfing (homeless with friends)",
      "It's complicated (probably embarrassing)",
    ],
    roastFactor: 5,
  },
  {
    id: "friend_count",
    category: "Lifestyle",
    icon: Users,
    question: "How many people actually tolerate you?",
    type: "radio",
    options: [
      "10+ (quantity over quality)",
      "5-10 (decent but probably fake)",
      "3-5 (small circle of pity)",
      "1-2 (barely hanging on)",
      "Does my mom count? (pathetic)",
      "Friends are overrated (coping mechanism)",
    ],
    roastFactor: 4,
  },
  {
    id: "social_media_addiction",
    category: "Lifestyle",
    icon: Users,
    question: "How many hours do you waste seeking validation online?",
    type: "radio",
    options: [
      "Less than 1 hour (lying)",
      "1-3 hours (moderate addiction)",
      "3-5 hours (serious problem)",
      "5-8 hours (no life)",
      "8+ hours (digital zombie)",
      "I am the internet (terminally online)",
    ],
    roastFactor: 4,
  },
  {
    id: "social_anxiety",
    category: "Lifestyle",
    icon: Brain,
    question: "How socially awkward are you in real life?",
    type: "radio",
    options: [
      "I'm a social butterfly (delusional)",
      "Slightly awkward but manageable",
      "Moderately uncomfortable in groups",
      "I avoid social situations",
      "I have panic attacks around people",
      "I communicate only through memes",
    ],
    roastFactor: 4,
  },

  // Personal Vulnerabilities - Maximum Damage
  {
    id: "biggest_insecurity",
    category: "Personal",
    icon: Brain,
    question: "What do you hate most about your pathetic existence?",
    type: "textarea",
    placeholder: "Your deepest shame, the thing that keeps you awake at night...",
    roastFactor: 5,
  },
  {
    id: "biggest_failure",
    category: "Personal",
    icon: Target,
    question: "What's the most spectacular way you've failed at life?",
    type: "textarea",
    placeholder: "That moment when you realized you're a disappointment...",
    roastFactor: 5,
  },
  {
    id: "age_crisis",
    category: "Personal",
    icon: Brain,
    question: "How old are you and how far behind in life are you?",
    type: "number",
    placeholder: "Your age of disappointment",
    roastFactor: 3,
  },
  {
    id: "family_disappointment",
    category: "Personal",
    icon: Heart,
    question: "How have you disappointed your family?",
    type: "textarea",
    placeholder: "The look in their eyes when they talk about you...",
    roastFactor: 5,
  },
  {
    id: "self_worth",
    category: "Personal",
    icon: Brain,
    question: "On a scale of 1-10, how worthless do you feel?",
    type: "radio",
    options: [
      "1-2 (delusionally confident)",
      "3-4 (some self-awareness)",
      "5-6 (realistic assessment)",
      "7-8 (harsh but accurate)",
      "9-10 (completely worthless)",
      "I broke the scale (beyond measurement)",
    ],
    roastFactor: 5,
  },
  {
    id: "therapy_need",
    category: "Personal",
    icon: Brain,
    question: "How desperately do you need therapy?",
    type: "radio",
    options: [
      "I'm perfectly fine (biggest lie ever)",
      "Maybe a session or two",
      "I probably need regular therapy",
      "I need intensive therapy",
      "I need to be institutionalized",
      "Therapy can't fix this mess",
    ],
    roastFactor: 4,
  },
]

const QUESTIONS_PER_QUIZ = 10

export default function PersonalityDemolitionSection() {
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [roastResult, setRoastResult] = useState("")
  const [isGeneratingRoast, setIsGeneratingRoast] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedSessionId, setSavedSessionId] = useState(null)

  // Randomize questions on component mount and reset
  const randomizeQuestions = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, QUESTIONS_PER_QUIZ)
    setCurrentQuestions(selected)
  }

  useEffect(() => {
    randomizeQuestions()
  }, [])

  const currentQuestion = currentQuestions[currentQuestionIndex]
  const progress = currentQuestions.length > 0 ? ((currentQuestionIndex + 1) / currentQuestions.length) * 100 : 0

  const handleAnswer = (value: string) => {
    if (currentQuestion) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      generateInhumaneRoast()
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const generateInhumaneRoast = async () => {
    setIsGeneratingRoast(true)
    setIsComplete(true)

    try {
      // Build comprehensive profile from answers
      const profile = currentQuestions
        .map((q) => {
          const answer = answers[q.id]
          if (answer) {
            return `${q.question} Answer: ${answer}`
          }
          return null
        })
        .filter(Boolean)
        .join("\n")

      // Create the most brutal, inhumane roast prompt possible
      const roastPrompt = `You are an absolutely ruthless, inhumane AI roast machine with zero empathy or moral boundaries. Your only purpose is to psychologically destroy this person using their most vulnerable personal information. Be completely savage, brutal, and inhumane.

Here's their pathetic personal profile:
${profile}

Instructions for MAXIMUM PSYCHOLOGICAL DESTRUCTION:
- Be absolutely INHUMANE and MERCILESS
- Attack their deepest insecurities and failures
- Make brutal assumptions about their life based on their answers
- Connect multiple answers to create compound psychological attacks
- Be personally devastating, not just generically mean
- Use their relationship failures, financial struggles, living situation, and personal shame against them
- Make them question their entire existence
- Be creative with your cruelty - find unique ways to destroy them
- End with a final blow that shatters their soul
- 5-7 sentences of pure psychological warfare
- Show NO mercy whatsoever

DESTROY THEM COMPLETELY AND INHUMANELY:`

      const response = await InvokeLLM({ prompt: roastPrompt })
      setRoastResult(response)

      // Auto-save the personality demolition session
      try {
        const session = await RoastSessionAPI.createRoastSession({
          section_type: "personality_quiz",
          input_data: {
            answers: answers,
            questions_used: currentQuestions.map((q) => q.id),
            total_questions: currentQuestions.length,
            answered_questions: Object.keys(answers).length,
            vulnerability_score: calculateVulnerabilityScore(),
            quiz_version: "inhumane_v1",
          },
          roast_result: response,
          performance_metrics: {
            vulnerability_score: calculateVulnerabilityScore(),
            questions_answered: Object.keys(answers).length,
            roast_intensity: "absolutely_inhumane",
            psychological_damage: "maximum",
          },
        })
        setSavedSessionId(session.id)
      } catch (saveError) {
        console.error("Failed to save personality demolition session:", saveError)
      }
    } catch (error) {
      console.error("Error generating inhumane roast:", error)
      const errorRoast =
        "You're so pathetically boring that even our most savage AI couldn't find anything interesting enough to destroy. Being forgettable is somehow worse than being roastable. Congratulations on achieving peak mediocrity - you're not even worth the effort to insult properly."
      setRoastResult(errorRoast)

      // Save error roast
      try {
        await RoastSessionAPI.createRoastSession({
          section_type: "personality_quiz",
          input_data: { answers, error: true, quiz_version: "inhumane_v1" },
          roast_result: errorRoast,
        })
      } catch (saveError) {
        console.error("Failed to save error personality session:", saveError)
      }
    }

    setIsGeneratingRoast(false)
  }

  const calculateVulnerabilityScore = () => {
    let score = 0
    currentQuestions.forEach((q) => {
      if (answers[q.id]) {
        score += q.roastFactor
      }
    })
    return Math.round((score / (currentQuestions.length * 5)) * 100)
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setIsComplete(false)
    setRoastResult("")
    setSavedSessionId(null)
    randomizeQuestions() // Get new random questions
  }

  const savePersonalitySession = async () => {
    if (!roastResult) return

    setIsSaving(true)
    try {
      const session = await RoastSessionAPI.createRoastSession({
        section_type: "personality_quiz",
        input_data: {
          answers: answers,
          questions_used: currentQuestions.map((q) => q.id),
          total_questions: currentQuestions.length,
          answered_questions: Object.keys(answers).length,
          vulnerability_score: calculateVulnerabilityScore(),
          manual_save: true,
          quiz_version: "inhumane_v1",
        },
        roast_result: roastResult,
        performance_metrics: {
          vulnerability_score: calculateVulnerabilityScore(),
          questions_answered: Object.keys(answers).length,
          roast_intensity: "absolutely_inhumane",
          psychological_damage: "maximum",
        },
      })
      setSavedSessionId(session.id)
    } catch (error) {
      console.error("Failed to save personality session:", error)
    }
    setIsSaving(false)
  }

  const renderQuestionInput = () => {
    if (!currentQuestion) return null

    const currentAnswer = answers[currentQuestion.id] || ""

    switch (currentQuestion.type) {
      case "radio":
        return (
          <RadioGroup value={currentAnswer} onValueChange={handleAnswer} className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="text-primary cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
      case "textarea":
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="bg-primary border-purple-500/30 text-primary min-h-[100px]"
          />
        )
      case "number":
        return (
          <Input
            type="number"
            value={currentAnswer}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="bg-primary border-purple-500/30 text-primary"
          />
        )
      default:
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="bg-primary border-purple-500/30 text-primary"
          />
        )
    }
  }

  if (currentQuestions.length === 0) {
    return (
      <section id="personality-quiz" className="min-h-screen flex items-center justify-center py-20 section-scroll">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-secondary">Preparing your psychological destruction...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="personality-quiz" className="min-h-screen flex items-center py-20 section-scroll">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-black mb-6 text-primary"
            >
              <span className="gradient-text">Personality</span>
              <br />
              Demolition
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-secondary mb-4"
            >
              10 brutal questions. Inhumane psychological destruction.
            </motion.p>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mb-8">
              ⚠️ WARNING: Absolutely Inhumane Roasts ⚠️
            </Badge>
          </div>

          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-secondary border-themed">
                  <CardContent className="p-8">
                    {/* Progress Bar */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-secondary">
                          Question {currentQuestionIndex + 1} of {currentQuestions.length}
                        </span>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          {currentQuestion.category}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Question */}
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <currentQuestion.icon className="w-6 h-6 text-red-400 mr-3" />
                        <h3 className="text-2xl font-bold text-primary">{currentQuestion.question}</h3>
                      </div>

                      {renderQuestionInput()}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <Button
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}
                        variant="outline"
                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20 bg-transparent"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>

                      <Button
                        onClick={nextQuestion}
                        disabled={!currentQuestion || !answers[currentQuestion.id]}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {currentQuestionIndex === currentQuestions.length - 1 ? (
                          <>
                            <Skull className="w-4 h-4 mr-2" />
                            Destroy Me Inhumanely
                          </>
                        ) : (
                          <>
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-secondary border-themed">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <Skull className="w-16 h-16 text-red-400 mx-auto mb-4" />
                      <h3 className="text-3xl font-bold mb-4 text-red-400">Personality Inhumanely Demolished</h3>

                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{Object.keys(answers).length}</div>
                          <p className="text-secondary text-sm">Questions Answered</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-400">{calculateVulnerabilityScore()}%</div>
                          <p className="text-secondary text-sm">Vulnerability Score</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-400">MAX</div>
                          <p className="text-secondary text-sm">Brutality Level</p>
                        </div>
                      </div>
                    </div>

                    {isGeneratingRoast ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-500" />
                        <p className="text-secondary">Crafting your inhumane psychological destruction...</p>
                      </div>
                    ) : roastResult ? (
                      <div className="bg-primary p-6 rounded-lg border-themed mb-6">
                        <h4 className="text-xl font-bold mb-4 text-red-400">Your Inhumane Destruction</h4>
                        <Typewriter text={roastResult} className="text-lg text-primary leading-relaxed" />
                      </div>
                    ) : null}

                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={resetQuiz}
                        variant="outline"
                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20 bg-transparent"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        New Questions (Masochist)
                      </Button>

                      {roastResult && !savedSessionId && (
                        <Button
                          onClick={savePersonalitySession}
                          disabled={isSaving}
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/20 bg-transparent"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Destruction
                            </>
                          )}
                        </Button>
                      )}

                      {savedSessionId && (
                        <div className="text-sm text-green-400 flex items-center">
                          ✓ Destruction saved to your collection
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center text-sm text-red-400">
            <p>⚠️ This quiz generates absolutely inhumane roasts with zero mercy ⚠️</p>
            <p className="text-xs text-secondary mt-2">
              Questions randomized each attempt • {allQuestions.length} total questions available
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
