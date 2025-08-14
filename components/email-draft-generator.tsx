"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wand2, Copy, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Lead {
  id: string
  name: string
  email: string
  event_type: string
  event_date?: string
  budget?: string
  message?: string
}

interface EmailDraftGeneratorProps {
  lead: Lead
  onDraftGenerated?: (draft: any) => void
}

const TEMPLATE_OPTIONS = [
  { value: "welcome", label: "Welcome Email", description: "First response to new leads" },
  { value: "follow_up", label: "Follow-up", description: "Check in with existing leads" },
  { value: "availability", label: "Availability Check", description: "Confirm date availability" },
  { value: "custom", label: "Custom", description: "Use your own prompt" },
]

export function EmailDraftGenerator({ lead, onDraftGenerated }: EmailDraftGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [templateType, setTemplateType] = useState("welcome")
  const [customPrompt, setCustomPrompt] = useState("")
  const [generatedDraft, setGeneratedDraft] = useState<{
    subject: string
    content: string
  } | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/generate-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: lead.id,
          templateType,
          customPrompt: templateType === "custom" ? customPrompt : undefined,
          saveDraft: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate draft")
      }

      const data = await response.json()
      setGeneratedDraft({
        subject: data.draft.subject,
        content: data.draft.content,
      })

      onDraftGenerated?.(data.draft)

      toast({
        title: "Draft Generated!",
        description: "Your email draft has been created and saved.",
      })
    } catch (error) {
      console.error("Error generating draft:", error)
      toast({
        title: "Error",
        description: "Failed to generate email draft. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Text copied to clipboard.",
      })
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Generate Email Draft
          </CardTitle>
          <CardDescription>Create a personalized email response for {lead.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lead Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-sm font-medium">Lead</Label>
              <p className="text-sm">{lead.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Event</Label>
              <p className="text-sm">{lead.event_type}</p>
            </div>
            {lead.event_date && (
              <div>
                <Label className="text-sm font-medium">Date</Label>
                <p className="text-sm">{new Date(lead.event_date).toLocaleDateString()}</p>
              </div>
            )}
            {lead.budget && (
              <div>
                <Label className="text-sm font-medium">Budget</Label>
                <p className="text-sm">{lead.budget}</p>
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Email Template</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger>
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Prompt */}
          {templateType === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom-prompt">Custom Prompt</Label>
              <Textarea
                id="custom-prompt"
                placeholder="Describe what kind of email you want to generate..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (templateType === "custom" && !customPrompt.trim())}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Email Draft
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Draft */}
      {generatedDraft && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Draft
              <Badge variant="secondary">AI Generated</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Subject</Label>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedDraft.subject)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Input value={generatedDraft.subject} readOnly />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Email Content</Label>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedDraft.content)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Textarea value={generatedDraft.content} readOnly rows={12} className="font-mono text-sm" />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent">
                Edit Draft
              </Button>
              <Button className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
