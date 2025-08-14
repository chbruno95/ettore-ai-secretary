import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DraftsList } from "@/components/drafts-list"
import { DraftGenerator } from "@/components/draft-generator"

export default async function DraftsPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch user's drafts
  const { data: drafts } = await supabase
    .from("email_drafts")
    .select(`
      *,
      leads (
        name,
        email,
        event_type,
        event_date
      )
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  // Fetch recent leads for draft generation
  const { data: recentLeads } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Drafts</h1>
        <p className="text-muted-foreground">Gestisci le bozze email generate dall'AI per i tuoi lead.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DraftsList drafts={drafts || []} />
        </div>
        <div>
          <DraftGenerator leads={recentLeads || []} />
        </div>
      </div>
    </div>
  )
}
