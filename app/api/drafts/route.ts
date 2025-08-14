import { type NextRequest, NextResponse } from "next/server"
import { getEmailDrafts } from "@/lib/ai/email-generator"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get("leadId")

    const drafts = await getEmailDrafts(user.id, leadId || undefined)

    return NextResponse.json({
      success: true,
      drafts,
    })
  } catch (error) {
    console.error("Error fetching drafts:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch drafts",
      },
      { status: 500 },
    )
  }
}
