"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Lead {
  id: string
  name: string
  email: string
  event_type: string
  event_date: string
  message?: string
}

interface DraftGeneratorProps {
  leads: Lead[]
}

export function DraftGenerator({ leads }: DraftGeneratorProps) {
  const { toast } = useToast()
  const [selectedLead, setSelectedLead] = useState<string>("")
  const [templateType, setTemplateType] = useState<string>("")
  const [customInstructions, setCustomInstructions] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateDraft = async () => {
    if (!selectedLead || !templateType) {
      toast({
        title: "Campi mancanti",
        description: "Seleziona un lead e un tipo di template.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/generate-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: selectedLead,
          templateType,
          customInstructions,
        }),
      })

      if (response.ok) {
        toast({
          title: "Bozza generata",
          description: "La bozza email è stata generata con successo.",
        })
        // Reset form
        setSelectedLead("")
        setTemplateType("")
        setCustomInstructions("")
        // Refresh the page to show new draft
        window.location.reload()
      } else {
        throw new Error("Failed to generate draft")
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile generare la bozza. Riprova.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Genera Nuova Bozza
        </CardTitle>
        <CardDescription>Usa l'AI per generare email personalizzate per i tuoi lead.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lead-select">Seleziona Lead</Label>
          <Select value={selectedLead} onValueChange={setSelectedLead}>
            <SelectTrigger>
              <SelectValue placeholder="Scegli un lead..." />
            </SelectTrigger>
            <SelectContent>
              {leads.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{lead.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {lead.event_type} - {new Date(lead.event_date).toLocaleDateString("it-IT")}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="template-select">Tipo di Template</Label>
          <Select value={templateType} onValueChange={setTemplateType}>
            <SelectTrigger>
              <SelectValue placeholder="Scegli un template..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Email di Benvenuto</SelectItem>
              <SelectItem value="follow_up">Follow-up</SelectItem>
              <SelectItem value="availability">Verifica Disponibilità</SelectItem>
              <SelectItem value="proposal">Proposta Commerciale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Istruzioni Personalizzate (Opzionale)</Label>
          <Textarea
            id="instructions"
            placeholder="Aggiungi dettagli specifici per personalizzare la risposta..."
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={generateDraft} disabled={isGenerating || !selectedLead || !templateType} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Genera Bozza
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
