import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardOverview } from "@/components/dashboard-overview"
import { RecentLeads } from "@/components/recent-leads"
import { QuickActions } from "@/components/quick-actions"

export default async function DashboardPage() {
  const supabase = createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user's leads and stats
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: newLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "new")

  const { count: totalDrafts } = await supabase
    .from("email_drafts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your leads.</p>
      </div>

      <DashboardOverview
        stats={{
          totalLeads: totalLeads || 0,
          newLeads: newLeads || 0,
          totalDrafts: totalDrafts || 0,
        }}
      />

      <div className="grid gap-8 md:grid-cols-2">
        <RecentLeads leads={leads || []} />
        <QuickActions />
      </div>
    </div>
  )
}
