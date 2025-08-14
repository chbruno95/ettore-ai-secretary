import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { LeadsList } from "@/components/leads-list"
import { LeadsFilters } from "@/components/leads-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface LeadsPageProps {
  searchParams: {
    status?: string
    search?: string
    page?: string
  }
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const supabase = createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Build query based on filters
  let query = supabase.from("leads").select("*").eq("user_id", user.id)

  if (searchParams.status && searchParams.status !== "all") {
    query = query.eq("status", searchParams.status)
  }

  if (searchParams.search) {
    query = query.or(
      `name.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%,event_type.ilike.%${searchParams.search}%`,
    )
  }

  const { data: leads, error: leadsError } = await query.order("created_at", { ascending: false })

  if (leadsError) {
    console.error("Error fetching leads:", leadsError)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Manage and track your wedding leads</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/leads/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Link>
        </Button>
      </div>

      <LeadsFilters />

      <LeadsList leads={leads || []} />
    </div>
  )
}
