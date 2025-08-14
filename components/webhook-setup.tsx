"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, TestTube, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WebhookSetupProps {
  userId: string
  currentWebhookUrl?: string
  apiKey?: string
}

export default function WebhookSetup({ userId, currentWebhookUrl, apiKey }: WebhookSetupProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)
  const { toast } = useToast()

  const webhookUrl = `${window.location.origin}/api/webhook/leads`

  const examplePayload = {
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1234567890",
    event_date: "2024-06-15",
    event_type: "wedding",
    budget_range: "$5000-$10000",
    message: "Looking for wedding photography services",
    source: "website_contact_form",
    user_id: userId,
    api_key: apiKey || "your_api_key_here",
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      })
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      })
    }
  }

  const testWebhook = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please generate an API key first",
        variant: "destructive",
      })
      return
    }

    setTesting(true)
    try {
      const response = await fetch("/api/webhook/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          api_key: apiKey,
        }),
      })

      const result = await response.json()

      if (result.test_successful) {
        toast({
          title: "Test Successful!",
          description: "Webhook is working correctly",
        })
      } else {
        toast({
          title: "Test Failed",
          description: result.webhook_response?.error || "Unknown error",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test webhook",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Webhook Configuration
            <Badge variant="secondary">API</Badge>
          </CardTitle>
          <CardDescription>
            Use this webhook to automatically receive leads from your website or other sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input id="webhook-url" value={webhookUrl} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}>
                {copied === "Webhook URL" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                value={apiKey || "Generate API key in settings"}
                readOnly
                className="font-mono text-sm"
                type="password"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => apiKey && copyToClipboard(apiKey, "API Key")}
                disabled={!apiKey}
              >
                {copied === "API Key" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={testWebhook}
              disabled={testing || !apiKey}
              className="flex items-center gap-2 bg-transparent"
            >
              <TestTube className="h-4 w-4" />
              {testing ? "Testing..." : "Test Webhook"}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`/api/webhook/leads?user_id=${userId}`, "_blank")}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Example Payload</CardTitle>
          <CardDescription>Send a POST request to the webhook URL with this JSON structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>JSON Payload</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(examplePayload, null, 2), "Example Payload")}
              >
                {copied === "Example Payload" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Textarea value={JSON.stringify(examplePayload, null, 2)} readOnly className="font-mono text-sm h-64" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Examples</CardTitle>
          <CardDescription>Common ways to integrate the webhook with your website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>HTML Form (with JavaScript)</Label>
            <Textarea
              readOnly
              className="font-mono text-sm"
              value={`<form id="contact-form">
  <input name="name" placeholder="Full Name" required>
  <input name="email" type="email" placeholder="Email" required>
  <input name="phone" placeholder="Phone">
  <input name="event_date" type="date" placeholder="Event Date">
  <select name="event_type">
    <option value="wedding">Wedding</option>
    <option value="engagement">Engagement</option>
  </select>
  <textarea name="message" placeholder="Message"></textarea>
  <button type="submit">Send</button>
</form>

<script>
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  await fetch('${webhookUrl}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      user_id: '${userId}',
      api_key: '${apiKey || "YOUR_API_KEY"}',
      source: 'website_contact_form'
    })
  });
});
</script>`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
