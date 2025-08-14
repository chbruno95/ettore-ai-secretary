"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Mail, Clock, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface EmailDraft {
  id: string
  subject: string
  content: string
  template_type: string
  status: string
  created_at: string
  leads: {
    name: string
    email: string
    event_type: string
  }
}

interface DraftHistoryProps {
  leadId?: string
  onSelectDraft?: (draft: EmailDraft) => void
}

export function DraftHistory({ leadId, onSelectDraft }: DraftHistoryProps) {
  const [drafts, setDrafts] = useState<EmailDraft[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDrafts()
  }, [leadId])

  const fetchDrafts = async () => {
    try {
      const url = leadId ? `/api/drafts?leadId=${leadId}` : "/api/drafts"
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setDrafts(data.drafts || [])
      }
    } catch (error) {
      console.error("Error fetching drafts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTemplateColor = (type: string) => {
    switch (type) {
      case "welcome":
        return "bg-blue-100 text-blue-800"
      case "follow_up":
        return "bg-green-100 text-green-800"
      case "availability":
        return "bg-purple-100 text-purple-800"
      case "proposal":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Draft History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Draft History
        </CardTitle>
        <CardDescription>{leadId ? "Drafts for this lead" : "Recent email drafts"}</CardDescription>
      </CardHeader>
      <CardContent>
        {drafts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No drafts found</p>
            <p className="text-sm">Generate your first email draft to get started</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {drafts.map((draft, index) => (
                <div key={draft.id}>
                  <div
                    className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onSelectDraft?.(draft)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">{draft.subject}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{draft.leads.name}</span>
                          <span>•</span>
                          <span>{draft.leads.event_type}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className={`text-xs ${getTemplateColor(draft.template_type)}`}>
                          {draft.template_type.replace("_", " ")}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(draft.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{draft.content.substring(0, 120)}...</p>
                  </div>
                  {index < drafts.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
