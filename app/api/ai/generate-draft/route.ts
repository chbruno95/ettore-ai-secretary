import { type NextRequest, NextResponse } from "next/server"
import { generateEmailDraft, saveEmailDraft, type EmailContext } from "@/lib/ai/email-generator"
import { createServerClient } from "@/lib/supabase/server"
import { z } from "zod"

const generateDraftSchema = z.object({
  leadId: z.string(),
  templateType: z.enum(["welcome", "follow_up", "proposal", "availability", "custom"]).default("welcome"),
  customPrompt: z.string().optional(),
  saveDraft: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { leadId, templateType, customPrompt, saveDraft } = generateDraftSchema.parse(body)

    // Get lead details
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .eq("user_id", user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Get user business details
    const { data: userSettings, error: settingsError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (settingsError) {
      console.error("Error fetching user settings:", settingsError)
    }

    // Prepare context for AI generation
    const context: EmailContext = {
      leadName: lead.name,
      leadEmail: lead.email,
      eventType: lead.event_type || "wedding",
      eventDate: lead.event_date,
      budget: lead.budget,
      message: lead.message,
      userBusinessName: userSettings?.business_name || "Our Business",
      userName: userSettings?.display_name || user.email?.split("@")[0] || "Team",
      userServices: userSettings?.services || [],
    }

    // Generate email draft
    const { content, subject } = await generateEmailDraft(context, templateType, customPrompt)

    let draftId = null
    if (saveDraft) {
      // Save draft to database
      const draft = await saveEmailDraft(user.id, leadId, subject, content, templateType)
      draftId = draft.id
    }

    return NextResponse.json({
      success: true,
      draft: {
        id: draftId,
        subject,
        content,
        templateType,
        leadId,
      },
    })
  } catch (error) {
    console.error("Error generating email draft:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to generate email draft",
      },
      { status: 500 },
    )
  }
}
