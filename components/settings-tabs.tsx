"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "@/components/profile-settings"
import { BusinessSettings } from "@/components/business-settings"
import { NotificationSettings } from "@/components/notification-settings"
import { AiSettings } from "@/components/ai-settings"
import { IntegrationSettings } from "@/components/integration-settings"
import { User, Building, Bell, Bot, Link } from "lucide-react"

interface SettingsTabsProps {
  user: any
  profile: any
  settings: any
}

export function SettingsTabs({ user, profile, settings }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="business" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Business
        </TabsTrigger>
        <TabsTrigger value="integrations" className="flex items-center gap-2">
          <Link className="h-4 w-4" />
          Integrazioni
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="ai" className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          AI Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <ProfileSettings user={user} profile={profile} />
      </TabsContent>

      <TabsContent value="business" className="space-y-6">
        <BusinessSettings profile={profile} />
      </TabsContent>

      <TabsContent value="integrations" className="space-y-6">
        <IntegrationSettings user={user} />
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <NotificationSettings settings={settings} />
      </TabsContent>

      <TabsContent value="ai" className="space-y-6">
        <AiSettings settings={settings} />
      </TabsContent>
    </Tabs>
  )
}
