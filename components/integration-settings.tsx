"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Mail, Globe, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface IntegrationSettingsProps {
  user: any
}

export function IntegrationSettings({ user }: IntegrationSettingsProps) {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Generate webhook URL based on user
    if (user?.id) {
      setWebhookUrl(`${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/leads`)
    }
  }, [user])

  const generateApiKey = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/user/generate-api-key", {
        method: "POST",
      })
      const data = await response.json()
      if (data.success) {
        setApiKey(data.apiKey)
        toast.success("API Key generata con successo!")
      }
    } catch (error) {
      toast.error("Errore nella generazione dell'API Key")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiato negli appunti!`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Integrazioni</h2>
        <p className="text-muted-foreground">
          Connetti Ettore al tuo Gmail e ai form del tuo sito web per automatizzare la gestione dei lead.
        </p>
      </div>

      <Tabs defaultValue="gmail" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gmail" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Gmail
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Sito Web
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gmail" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Connessione Gmail
              </CardTitle>
              <CardDescription>
                Connetti il tuo account Gmail per inviare automaticamente le email generate dall'AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Per connettere Gmail, dovrai configurare l'autenticazione OAuth2. Segui questi passaggi:
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">1. Configura Google Cloud Console</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>
                      Vai su{" "}
                      <a
                        href="https://console.cloud.google.com"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                        rel="noreferrer"
                      >
                        Google Cloud Console
                      </a>
                    </li>
                    <li>Crea un nuovo progetto o seleziona uno esistente</li>
                    <li>Abilita l'API Gmail</li>
                    <li>Crea credenziali OAuth2 per applicazione web</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">2. Configura Zapier (Opzione Semplice)</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>
                      Crea un account su{" "}
                      <a
                        href="https://zapier.com"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                        rel="noreferrer"
                      >
                        Zapier
                      </a>
                    </li>
                    <li>Crea un nuovo Zap: Webhook → Gmail</li>
                    <li>Usa il webhook URL qui sotto come trigger</li>
                    <li>Configura Gmail per inviare email con i dati ricevuti</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL per Zapier</Label>
                  <div className="flex gap-2">
                    <Input id="webhook-url" value={webhookUrl} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Connessione Sito Web
              </CardTitle>
              <CardDescription>Connetti i form di contatto del tuo sito WordPress o Squarespace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={generateApiKey} disabled={isGenerating} variant={apiKey ? "outline" : "default"}>
                    {isGenerating ? "Generando..." : apiKey ? "Rigenera API Key" : "Genera API Key"}
                  </Button>
                  {apiKey && (
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(apiKey, "API Key")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {apiKey && (
                  <div className="space-y-2">
                    <Label>La tua API Key</Label>
                    <Input value={apiKey} readOnly className="font-mono text-sm" />
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    WordPress
                    <Badge variant="secondary">Popolare</Badge>
                  </h4>

                  <div className="space-y-3">
                    <h5 className="font-medium">Contact Form 7</h5>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm">
                        {`// Aggiungi questo al functions.php del tuo tema
add_action('wpcf7_mail_sent', 'send_to_ettore');

function send_to_ettore($contact_form) {
    $submission = WPCF7_Submission::get_instance();
    $posted_data = $submission->get_posted_data();
    
    $data = array(
        'name' => $posted_data['your-name'],
        'email' => $posted_data['your-email'],
        'phone' => $posted_data['your-phone'],
        'message' => $posted_data['your-message'],
        'event_date' => $posted_data['event-date'],
        'budget' => $posted_data['budget']
    );
    
    wp_remote_post('${webhookUrl}', array(
        'body' => json_encode($data),
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-API-Key' => '${apiKey || "YOUR_API_KEY"}'
        )
    ));
}`}
                      </code>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium">Gravity Forms</h5>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm">
                        {`// Aggiungi questo al functions.php del tuo tema
add_action('gform_after_submission', 'send_gravity_to_ettore', 10, 2);

function send_gravity_to_ettore($entry, $form) {
    $data = array(
        'name' => rgar($entry, '1'),
        'email' => rgar($entry, '2'),
        'phone' => rgar($entry, '3'),
        'message' => rgar($entry, '4'),
        'event_date' => rgar($entry, '5'),
        'budget' => rgar($entry, '6')
    );
    
    wp_remote_post('${webhookUrl}', array(
        'body' => json_encode($data),
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-API-Key' => '${apiKey || "YOUR_API_KEY"}'
        )
    ));
}`}
                      </code>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Squarespace</h4>
                  <p className="text-sm text-muted-foreground">Per Squarespace, usa Zapier per connettere i form:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>Crea un Zap: Squarespace Form → Webhook</li>
                    <li>
                      Configura il webhook per inviare a: <code className="bg-muted px-1 rounded">{webhookUrl}</code>
                    </li>
                    <li>
                      Aggiungi l'header:{" "}
                      <code className="bg-muted px-1 rounded">X-API-Key: {apiKey || "YOUR_API_KEY"}</code>
                    </li>
                    <li>Mappa i campi del form ai dati del lead</li>
                  </ul>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Test Integrazione</h4>
                  <p className="text-sm text-muted-foreground">
                    Puoi testare l'integrazione inviando una richiesta POST al webhook:
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">
                      {`curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey || "YOUR_API_KEY"}" \\
  -d '{
    "name": "Mario Rossi",
    "email": "mario@example.com",
    "phone": "+39 123 456 7890",
    "message": "Interessato ai vostri servizi per matrimonio",
    "event_date": "2024-06-15",
    "budget": "5000-10000"
  }'`}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
