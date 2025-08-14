"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Bot, MessageSquare, Zap, Settings } from "lucide-react"

interface AiSettingsProps {
  settings: any
}

export function AiSettings({ settings }: AiSettingsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    ai_tone: settings?.ai_tone || "professional",
    ai_creativity: settings?.ai_creativity || [0.7],
    auto_generate_drafts: settings?.auto_generate_drafts || false,
    custom_instructions: settings?.custom_instructions || "",
    signature: settings?.signature || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/ai-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          ai_creativity: formData.ai_creativity[0],
        }),
      })

      if (response.ok) {
        toast({
          title: "AI Settings Updated",
          description: "Your AI preferences have been updated successfully.",
        })
      } else {
        throw new Error("Failed to update AI settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update AI settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Assistant Settings
        </CardTitle>
        <CardDescription>Customize how the AI generates email drafts and responses.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="ai_tone">Communication Tone</Label>
            <Select value={formData.ai_tone} onValueChange={(value) => handleChange("ai_tone", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="warm">Warm & Personal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This affects how the AI writes your email responses to leads.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Creativity Level</Label>
            <div className="px-3">
              <Slider
                value={formData.ai_creativity}
                onValueChange={(value) => handleChange("ai_creativity", value)}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Conservative</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Higher creativity means more varied and unique responses, lower means more consistent and predictable.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto_generate">Auto-generate Drafts</Label>
              <p className="text-xs text-muted-foreground">Automatically create email drafts when new leads arrive</p>
            </div>
            <Switch
              id="auto_generate"
              checked={formData.auto_generate_drafts}
              onCheckedChange={(checked) => handleChange("auto_generate_drafts", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_instructions">Custom Instructions</Label>
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-3" />
              <Textarea
                id="custom_instructions"
                value={formData.custom_instructions}
                onChange={(e) => handleChange("custom_instructions", e.target.value)}
                placeholder="Always mention our 10+ years of experience and include a link to our portfolio..."
                rows={4}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              These instructions will be included in every AI-generated email draft.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Email Signature</Label>
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 text-muted-foreground mt-3" />
              <Textarea
                id="signature"
                value={formData.signature}
                onChange={(e) => handleChange("signature", e.target.value)}
                placeholder="Best regards,&#10;John Smith&#10;Wedding Photographer&#10;www.johnsmithphoto.com&#10;(555) 123-4567"
                rows={4}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This signature will be automatically added to all generated email drafts.
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
            <div className="flex items-start gap-2">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">AI Tips</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Be specific in custom instructions for better results</li>
                  <li>• Professional tone works best for most wedding inquiries</li>
                  <li>• Medium creativity (0.7) balances uniqueness with consistency</li>
                </ul>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Updating..." : "Update AI Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
