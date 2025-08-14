"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Calendar, User, Edit3, Send, Copy, Trash2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"

interface Draft {
  id: string
  subject: string
  content: string
  template_type: string
  created_at: string
  leads: {
    name: string
    email: string
    event_type: string
    event_date: string
  }
}

interface DraftsListProps {
  drafts: Draft[]
}

export function DraftsList({ drafts }: DraftsListProps) {
  const { toast } = useToast()
  const [expandedDraft, setExpandedDraft] = useState<string | null>(null)
  const [editingDraft, setEditingDraft] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState("")
  const [editedSubject, setEditedSubject] = useState("")

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiato negli appunti",
      description: "Il contenuto è stato copiato negli appunti.",
    })
  }

  const startEditing = (draft: Draft) => {
    setEditingDraft(draft.id)
    setEditedContent(draft.content)
    setEditedSubject(draft.subject)
  }

  const saveEdit = async (draftId: string) => {
    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: editedSubject,
          content: editedContent,
        }),
      })

      if (response.ok) {
        toast({
          title: "Bozza aggiornata",
          description: "Le modifiche sono state salvate con successo.",
        })
        setEditingDraft(null)
        // Refresh the page to show updated content
        window.location.reload()
      } else {
        throw new Error("Failed to update draft")
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare le modifiche. Riprova.",
        variant: "destructive",
      })
    }
  }

  const deleteDraft = async (draftId: string) => {
    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Bozza eliminata",
          description: "La bozza è stata eliminata con successo.",
        })
        // Refresh the page to show updated list
        window.location.reload()
      } else {
        throw new Error("Failed to delete draft")
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare la bozza. Riprova.",
        variant: "destructive",
      })
    }
  }

  const getTemplateColor = (type: string) => {
    switch (type) {
      case "welcome":
        return "bg-green-100 text-green-800"
      case "follow_up":
        return "bg-blue-100 text-blue-800"
      case "availability":
        return "bg-purple-100 text-purple-800"
      case "proposal":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTemplateLabel = (type: string) => {
    switch (type) {
      case "welcome":
        return "Benvenuto"
      case "follow_up":
        return "Follow-up"
      case "availability":
        return "Disponibilità"
      case "proposal":
        return "Proposta"
      default:
        return type
    }
  }

  if (drafts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nessuna bozza trovata</h3>
          <p className="text-muted-foreground text-center">
            Genera la tua prima bozza email usando l'AI per rispondere ai lead.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <Card key={draft.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">
                    {editingDraft === draft.id ? (
                      <Input
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        className="text-lg font-semibold"
                      />
                    ) : (
                      draft.subject
                    )}
                  </CardTitle>
                  <Badge className={getTemplateColor(draft.template_type)}>
                    {getTemplateLabel(draft.template_type)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {draft.leads.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {draft.leads.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(draft.leads.event_date).toLocaleDateString("it-IT")}
                  </span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedDraft(expandedDraft === draft.id ? null : draft.id)}
                >
                  {expandedDraft === draft.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => startEditing(draft)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(draft.content)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteDraft(draft.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedDraft === draft.id && (
            <CardContent>
              <div className="space-y-4">
                {editingDraft === draft.id ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Oggetto</Label>
                      <Input id="subject" value={editedSubject} onChange={(e) => setEditedSubject(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Contenuto</Label>
                      <Textarea
                        id="content"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={12}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => saveEdit(draft.id)}>Salva modifiche</Button>
                      <Button variant="outline" onClick={() => setEditingDraft(null)}>
                        Annulla
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{draft.content}</pre>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        Creata{" "}
                        {formatDistanceToNow(new Date(draft.created_at), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => copyToClipboard(draft.content)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copia
                        </Button>
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Invia Email
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
