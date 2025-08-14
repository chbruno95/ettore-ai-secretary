import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { SettingsTabs } from "@/components/settings-tabs"

export default async function SettingsPage() {
  const supabase = createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile and settings
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  const { data: settings } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings, business information, and preferences.</p>
      </div>

      <SettingsTabs user={user} profile={profile} settings={settings} />
    </div>
  )
}
