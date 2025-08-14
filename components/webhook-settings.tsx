"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Copy, RefreshCw, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WebhookSettingsProps {
  settings: any
}

export function WebhookSettings({ settings }: WebhookSettingsProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [apiKey, setApiKey] = useState(settings?.webhook_api_key || "")

  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/leads`
  const testUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/test`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The URL has been copied to your clipboard.",
    })
  }

  const generateApiKey = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/user/generate-api-key", {
        method: "POST",
      })
      const data = await response.json()
      setApiKey(data.apiKey)
      toast({
        title: "API Key Generated",
        description: "Your new API key has been generated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const testWebhook = async () => {
    try {
      const response = await fetch(testUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({
          name: "Test Lead",
          email: "test@example.com",
          phone: "+1234567890",
          event_date: "2024-06-15",
          event_type: "Wedding",
          message: "This is a test webhook submission.",
        }),
      })

      if (response.ok) {
        toast({
          title: "Webhook Test Successful",
          description: "Test lead has been created successfully.",
        })
      } else {
        throw new Error("Webhook test failed")
      }
    } catch (error) {
      toast({
        title: "Webhook Test Failed",
        description: "Please check your API key and try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Webhook URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Webhook Endpoint
          </CardTitle>
          <CardDescription>Use this URL to receive leads from your website forms or other sources.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input id="webhook-url" value={webhookUrl} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>HTTP Method</Label>
            <Badge variant="secondary">POST</Badge>
          </div>

          <div className="space-y-2">
            <Label>Content Type</Label>
            <Badge variant="secondary">application/json</Badge>
          </div>
        </CardContent>
      </Card>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            API Authentication
          </CardTitle>
          <CardDescription>Generate and manage your API key for webhook authentication.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                readOnly
                placeholder="Generate an API key to get started"
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(apiKey)} disabled={!apiKey}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button onClick={generateApiKey} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {apiKey ? "Regenerate API Key" : "Generate API Key"}
              </>
            )}
          </Button>

          {apiKey && (
            <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Keep your API key secure</p>
                  <p>Include this key in the X-API-Key header when making webhook requests.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Webhook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Test Webhook
          </CardTitle>
          <CardDescription>Send a test request to verify your webhook is working correctly.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testWebhook} disabled={!apiKey} className="w-full">
            <CheckCircle className="mr-2 h-4 w-4" />
            Send Test Request
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Gmail Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819l6.545 4.91 6.545-4.91h3.819A1.636 1.636 0 0 1 24 5.457z" />
            </svg>
            Gmail Integration
          </CardTitle>
          <CardDescription>Configure Gmail to automatically forward leads to Ettore.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Create a dedicated Gmail account for lead collection (es: leads@tuobusiness.com)</li>
              <li>Set up email forwarding rules to send leads to this account</li>
              <li>Use Gmail API or Zapier to parse emails and send to webhook</li>
              <li>Configure email templates to extract: name, email, event date, message</li>
            </ol>
          </div>

          <div className="space-y-2">
            <Label>Zapier Webhook Configuration</Label>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{`Trigger: Gmail - New Email
Filter: Subject contains "Wedding Inquiry" or "Event Request"
Action: Webhooks - POST Request
URL: ${webhookUrl}
Headers: X-API-Key: ${apiKey || "YOUR_API_KEY"}
Body: Extract data from email content`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* WordPress Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.109m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.135-2.85-.135-.584-.031-.661.854-.082.899 0 0 .537.075 1.104.105l1.644 4.505L9.281 18.675l-2.926-8.64c.649-.03 1.234-.105 1.234-.105.583-.075.516-.93-.066-.899 0 0-1.755.135-2.88.135-.203 0-.44-.006-.69-.015C6.57 5.033 9.1 3.25 12 3.25c2.18 0 4.157.83 5.65 2.197-.036-.002-.072-.007-.109-.007-.428 0-.73.375-.73.777 0 .36.207.667.428.99.165.255.36.585.36 1.061 0 .33-.127.778-.292 1.553l-.385 1.287-1.395 4.665zm-5.604 5.555l2.919 7.99c.07.018.14.033.212.045 2.904-.935 4.988-3.684 4.988-6.9 0-1.193-.29-2.322-.794-3.32l-2.207-6.853c-1.395 2.69-2.572 5.006-5.118 9.038zm-5.131-1.42c0 1.935.471 3.756 1.308 5.366l-1.067-3.085C1.917 10.498 1.875 9.4 1.875 8.6c0-.615.059-1.195.165-1.756C1.433 8.018 1.25 9.28 1.25 10.965z" />
            </svg>
            WordPress Form Integration
          </CardTitle>
          <CardDescription>Connect your WordPress contact forms directly to Ettore.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4 border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Popular Plugin Integrations:</h4>
            <div className="text-sm text-green-800 space-y-3">
              <div>
                <strong>Contact Form 7:</strong>
                <p>Add webhook action to form submission using CF7 Webhook plugin</p>
              </div>
              <div>
                <strong>Gravity Forms:</strong>
                <p>Use built-in webhook notifications in form settings</p>
              </div>
              <div>
                <strong>WPForms:</strong>
                <p>Configure webhook in Form Settings → Notifications</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>WordPress Hook Example (functions.php)</Label>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{`// Add to your theme's functions.php
add_action('wpcf7_mail_sent', 'send_to_ettore_webhook');

function send_to_ettore_webhook($contact_form) {
    $submission = WPCF7_Submission::get_instance();
    $posted_data = $submission->get_posted_data();
    
    $webhook_data = array(
        'name' => $posted_data['your-name'],
        'email' => $posted_data['your-email'],
        'phone' => $posted_data['your-phone'],
        'event_date' => $posted_data['event-date'],
        'event_type' => $posted_data['event-type'],
        'message' => $posted_data['your-message']
    );
    
    wp_remote_post('${webhookUrl}', array(
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-API-Key' => '${apiKey || "YOUR_API_KEY"}'
        ),
        'body' => json_encode($webhook_data)
    ));
}`}</code>
            </pre>
          </div>

          <div className="space-y-2">
            <Label>Form Field Mapping</Label>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>Nome cliente:</span>
                <code>your-name</code>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>Email:</span>
                <code>your-email</code>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>Telefono:</span>
                <code>your-phone</code>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>Data evento:</span>
                <code>event-date</code>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>Tipo evento:</span>
                <code>event-type</code>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>Messaggio:</span>
                <code>your-message</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Examples</CardTitle>
          <CardDescription>Sample code for integrating with popular form builders and websites.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>JavaScript/Fetch Example</Label>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{`fetch('${webhookUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': '${apiKey || "YOUR_API_KEY"}'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    event_date: '2024-06-15',
    event_type: 'Wedding',
    message: 'Looking for wedding photography services.'
  })
})`}</code>
            </pre>
          </div>

          <div className="space-y-2">
            <Label>Required Fields</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Badge variant="outline">name</Badge>
              <Badge variant="outline">email</Badge>
              <Badge variant="outline">event_date</Badge>
              <Badge variant="outline">event_type</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Optional Fields</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Badge variant="secondary">phone</Badge>
              <Badge variant="secondary">message</Badge>
              <Badge variant="secondary">budget</Badge>
              <Badge variant="secondary">guest_count</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
