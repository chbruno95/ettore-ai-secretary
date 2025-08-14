import { redirect, notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { LeadDetails } from "@/components/lead-details"
import { EmailDraftGenerator } from "@/components/email-draft-generator"
import { DraftHistory } from "@/components/draft-history"

interface LeadPageProps {
  params: {
    id: string
  }
}

export default async function LeadPage({ params }: LeadPageProps) {
  const supabase = createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get lead details
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (leadError || !lead) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <LeadDetails lead={lead} />

      <div className="grid gap-8 lg:grid-cols-2">
        <EmailDraftGenerator lead={lead} />
        <DraftHistory leadId={lead.id} />
      </div>
    </div>
  )
}
