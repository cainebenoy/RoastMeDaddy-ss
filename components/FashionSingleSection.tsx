"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadFile, InvokeLLM } from "@/integrations/Core"
import { Upload, Loader2, ImageIcon, Save } from "lucide-react"
import Typewriter from "./common/Typewriter"
import { RoastSessionAPI } from "@/lib/roast-session-api"

const wittyLoaders = [
  "Sharpening insults...",
  "Loading sarcasm module...",
  "Brewing fresh haterade...",
  "Consulting the book of burns...",
  "Finding the perfect put-down...",
]

export default function FashionSingleSection() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [roast, setRoast] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [wittyMessage, setWittyMessage] = useState(wittyLoaders[0])
  const [savedSessionId, setSavedSessionId] = useState(null)

  const handleFileUpload = (uploadedFile) => {
    setFile(uploadedFile)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(uploadedFile)
    setRoast("")
    setSavedSessionId(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      handleFileUpload(droppedFile)
    }
  }

  const analyzeStyle = async () => {
    if (!file) return

    setIsLoading(true)
    const messageInterval = setInterval(() => {
      setWittyMessage(wittyLoaders[Math.floor(Math.random() * wittyLoaders.length)])
    }, 1500)

    try {
      const { file_url } = await UploadFile({ file })

      const response = await InvokeLLM({
        prompt:
          "You are a brutally honest fashion critic with no filter. Analyze this person's outfit and deliver a new, unique, and savage, witty roast about their fashion choices. Do not repeat roasts. Be creative, specific, and absolutely ruthless. Make it funny but cutting. Focus on colors, fit, style choices, and overall aesthetic. Keep it to 2-3 sentences maximum.",
        file_urls: [file_url],
      })

      setRoast(response)

      // Auto-save the roast session
      try {
        const session = await RoastSessionAPI.createRoastSession({
          section_type: "fashion_single",
          input_data: {
            file_name: file.name,
            file_size: file.size,
            file_url: file_url,
          },
          roast_result: response,
        })
        setSavedSessionId(session.id)
      } catch (saveError) {
        console.error("Failed to save roast session:", saveError)
      }
    } catch (error) {
      const errorRoast = "Even our AI is too embarrassed to comment on this tragedy."
      setRoast(errorRoast)

      // Save error roast too
      try {
        await RoastSessionAPI.createRoastSession({
          section_type: "fashion_single",
          input_data: { error: true, file_name: file?.name },
          roast_result: errorRoast,
        })
      } catch (saveError) {
        console.error("Failed to save error roast session:", saveError)
      }
    }
    clearInterval(messageInterval)
    setIsLoading(false)
  }

  const saveRoastSession = async () => {
    if (!roast) return

    setIsSaving(true)
    try {
      const session = await RoastSessionAPI.createRoastSession({
        section_type: "fashion_single",
        input_data: {
          file_name: file?.name,
          file_size: file?.size,
          manual_save: true,
        },
        roast_result: roast,
      })
      setSavedSessionId(session.id)
    } catch (error) {
      console.error("Failed to save roast session:", error)
    }
    setIsSaving(false)
  }

  return (
    <section id="fashion-single" className="min-h-screen flex items-center py-20 section-scroll">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-primary">
            <span className="gradient-text">The Digital Mirror</span>
            <br />
            Crack'd
          </h2>
          <p className="text-xl text-secondary mb-12">Drop a pic of your 'fit. We'll be the judge.</p>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-secondary border-themed hover:border-purple-500/40 transition-all duration-300">
              <CardContent className="p-8">
                {!preview ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOver(true)
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => document.getElementById("fashion-upload")?.click()}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${dragOver ? "border-purple-500 bg-purple-500/10" : "border-purple-500/30 hover:border-purple-500/60"}`}
                  >
                    <Upload className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2 text-primary">Drop your fashion disaster here</p>
                    <p className="text-secondary text-sm">or click to browse</p>
                    <input
                      id="fashion-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt="Your outfit"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      onClick={() => {
                        setFile(null)
                        setPreview(null)
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

                {preview && (
                  <Button
                    onClick={analyzeStyle}
                    disabled={isLoading}
                    className="w-full mt-6 bg-purple-500 hover:bg-purple-600"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {wittyMessage}
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Analyze My Style
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-secondary border-themed">
              <CardContent className="p-8 h-full flex flex-col justify-center">
                {roast ? (
                  <div className="text-center w-full">
                    <h3 className="text-2xl font-bold mb-4 text-purple-400">Your Roast</h3>
                    <Typewriter text={roast} className="text-lg text-primary leading-relaxed mb-6" />

                    <div className="flex justify-center gap-4">
                      {!savedSessionId && (
                        <Button
                          onClick={saveRoastSession}
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
                              Save Roast
                            </>
                          )}
                        </Button>
                      )}
                      {savedSessionId && (
                        <div className="text-sm text-green-400 flex items-center">✓ Roast saved to your collection</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-secondary">
                    <p className="text-lg">Upload an image to receive your fashion verdict</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
