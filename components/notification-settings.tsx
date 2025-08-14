"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bell, Mail, MessageSquare, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NotificationPreferences {
  email_notifications: boolean
  new_lead_email: boolean
  status_change_email: boolean
  draft_generated_email: boolean
  daily_summary: boolean
  weekly_report: boolean
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    new_lead_email: true,
    status_change_email: true,
    draft_generated_email: true,
    daily_summary: false,
    weekly_report: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/user/notification-preferences")
      if (response.ok) {
        const data = await response.json()
        if (data.preferences) {
          setPreferences(data.preferences)
        }
      }
    } catch (error) {
      console.error("Error fetching preferences:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/notification-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences }),
      })

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Your notification preferences have been updated.",
        })
      } else {
        throw new Error("Failed to save preferences")
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save notification preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const testNotification = async () => {
    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Test Sent",
          description: "A test notification has been sent to your email.",
        })
      } else {
        throw new Error("Failed to send test notification")
      }
    } catch (error) {
      console.error("Error sending test notification:", error)
      toast({
        title: "Error",
        description: "Failed to send test notification. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
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
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>Manage how and when you receive notifications about your leads</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Email Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Enable or disable all email notifications</p>
          </div>
          <Switch
            checked={preferences.email_notifications}
            onCheckedChange={(checked) => handlePreferenceChange("email_notifications", checked)}
          />
        </div>

        <Separator />

        {/* Individual Email Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">EMAIL TYPES</h4>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">New Lead Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get notified when new leads are received</p>
                </div>
              </div>
              <Switch
                checked={preferences.new_lead_email}
                onCheckedChange={(checked) => handlePreferenceChange("new_lead_email", checked)}
                disabled={!preferences.email_notifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Status Change Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get notified when lead status changes</p>
                </div>
              </div>
              <Switch
                checked={preferences.status_change_email}
                onCheckedChange={(checked) => handlePreferenceChange("status_change_email", checked)}
                disabled={!preferences.email_notifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 text-muted-foreground">✨</div>
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">AI Draft Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get notified when AI generates email drafts</p>
                </div>
              </div>
              <Switch
                checked={preferences.draft_generated_email}
                onCheckedChange={(checked) => handlePreferenceChange("draft_generated_email", checked)}
                disabled={!preferences.email_notifications}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Summary Reports */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">SUMMARY REPORTS</h4>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Daily Summary</Label>
                  <p className="text-xs text-muted-foreground">Daily recap of leads and activities</p>
                </div>
              </div>
              <Switch
                checked={preferences.daily_summary}
                onCheckedChange={(checked) => handlePreferenceChange("daily_summary", checked)}
                disabled={!preferences.email_notifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Weekly Report</Label>
                  <p className="text-xs text-muted-foreground">Weekly performance and insights report</p>
                </div>
              </div>
              <Switch
                checked={preferences.weekly_report}
                onCheckedChange={(checked) => handlePreferenceChange("weekly_report", checked)}
                disabled={!preferences.email_notifications}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={testNotification}>
            Send Test Email
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
