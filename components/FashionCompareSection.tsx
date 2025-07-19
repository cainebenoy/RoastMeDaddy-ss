"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadFile, InvokeLLM } from "@/integrations/Core"
import { Upload, Loader2, Zap, Save } from "lucide-react"
import Typewriter from "./common/Typewriter"
import { RoastSessionAPI } from "@/lib/roast-session-api"

export default function FashionCompareSection() {
  const [files, setFiles] = useState({ left: null, right: null })
  const [previews, setPreviews] = useState({ left: null, right: null })
  const [roast, setRoast] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedSessionId, setSavedSessionId] = useState(null)

  const handleFileUpload = (side, uploadedFile) => {
    setFiles((prev) => ({ ...prev, [side]: uploadedFile }))
    const reader = new FileReader()
    reader.onload = (e) => setPreviews((prev) => ({ ...prev, [side]: e.target.result }))
    reader.readAsDataURL(uploadedFile)
    setRoast("")
    setSavedSessionId(null)
  }

  const compareStyles = async () => {
    if (!files.left || !files.right) return

    setIsLoading(true)
    try {
      const leftUpload = await UploadFile({ file: files.left })
      const rightUpload = await UploadFile({ file: files.right })

      const response = await InvokeLLM({
        prompt:
          "You are comparing two fashion choices. Look at both images and deliver a new, unique, and savage comparison roast. Do not repeat roasts. Pick a 'winner' (the marginally less terrible one) and roast both outfits with comparative insults. Be witty, specific, and absolutely brutal. Make it funny but cutting. 3-4 sentences maximum.",
        file_urls: [leftUpload.file_url, rightUpload.file_url],
      })

      setRoast(response)

      // Auto-save the fashion comparison session
      try {
        const session = await RoastSessionAPI.createRoastSession({
          section_type: "fashion_comparison",
          input_data: {
            left_file: {
              name: files.left.name,
              size: files.left.size,
              url: leftUpload.file_url,
            },
            right_file: {
              name: files.right.name,
              size: files.right.size,
              url: rightUpload.file_url,
            },
          },
          roast_result: response,
        })
        setSavedSessionId(session.id)
      } catch (saveError) {
        console.error("Failed to save fashion comparison session:", saveError)
      }
    } catch (error) {
      const errorRoast =
        "Both outfits are so bad, they crashed our AI. Congratulations on achieving new levels of fashion failure."
      setRoast(errorRoast)

      // Save error roast too
      try {
        await RoastSessionAPI.createRoastSession({
          section_type: "fashion_comparison",
          input_data: { error: true, left_file: files.left?.name, right_file: files.right?.name },
          roast_result: errorRoast,
        })
      } catch (saveError) {
        console.error("Failed to save error fashion comparison session:", saveError)
      }
    }
    setIsLoading(false)
  }

  const saveFashionComparison = async () => {
    if (!roast) return

    setIsSaving(true)
    try {
      const session = await RoastSessionAPI.createRoastSession({
        section_type: "fashion_comparison",
        input_data: {
          left_file: { name: files.left?.name, size: files.left?.size },
          right_file: { name: files.right?.name, size: files.right?.size },
          manual_save: true,
        },
        roast_result: roast,
      })
      setSavedSessionId(session.id)
    } catch (error) {
      console.error("Failed to save fashion comparison session:", error)
    }
    setIsSaving(false)
  }

  const UploadCard = ({ side, label }) => (
    <Card className="bg-secondary border-themed hover:border-purple-500/40 transition-all duration-300">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4 text-center text-primary">{label}</h3>
        {!previews[side] ? (
          <div
            onClick={() => document.getElementById(`compare-upload-${side}`)?.click()}
            className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/60 transition-all duration-300 h-48 flex flex-col justify-center"
          >
            <Upload className="w-12 h-12 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-secondary">Click to upload</p>
            <input
              id={`compare-upload-${side}`}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files[0] && handleFileUpload(side, e.target.files[0])}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative">
            <img
              src={previews[side] || "/placeholder.svg"}
              alt={`${label} outfit`}
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              onClick={() => {
                setFiles((prev) => ({ ...prev, [side]: null }))
                setPreviews((prev) => ({ ...prev, [side]: null }))
                setRoast("")
                setSavedSessionId(null)
              }}
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
            >
              Change
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <section id="fashion-compare" className="min-h-screen flex items-center py-20 section-scroll">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-primary">
            <span className="gradient-text">Clash of the</span>
            <br />
            Tasteless
          </h2>
          <p className="text-xl text-secondary mb-12">Battle of the fashion disasters. Who wore it worse?</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
            <UploadCard side="left" label="You" />

            <div className="flex flex-col items-center space-y-4">
              <div className="text-4xl font-black text-purple-500">VS</div>
              <Button
                onClick={compareStyles}
                disabled={isLoading || !files.left || !files.right}
                className="bg-purple-500 hover:bg-purple-600 px-8 py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Judging...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Compare & Despair
                  </>
                )}
              </Button>
            </div>

            <UploadCard side="right" label="Your 'Friend'?" />
          </div>

          {roast && (
            <Card className="mt-12 bg-secondary border-themed">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-purple-400">The Verdict</h3>
                <Typewriter text={roast} className="text-lg text-primary leading-relaxed mb-6" />

                <div className="flex justify-center gap-4">
                  {!savedSessionId && (
                    <Button
                      onClick={saveFashionComparison}
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
                          Save Comparison
                        </>
                      )}
                    </Button>
                  )}
                  {savedSessionId && (
                    <div className="text-sm text-green-400 flex items-center">
                      ✓ Comparison saved to your collection
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
