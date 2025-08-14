import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import {
  sendNewLeadNotification,
  sendStatusChangeNotification,
  sendDraftGeneratedNotification,
} from "@/lib/email/notification-service"
import { z } from "zod"

const sendNotificationSchema = z.object({
  type: z.enum(["new_lead", "status_change", "draft_generated"]),
  leadId: z.string().uuid(),
  context: z
    .object({
      oldStatus: z.string().optional(),
      newStatus: z.string().optional(),
      draftId: z.string().optional(),
    })
    .optional(),
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
    const { type, leadId, context } = sendNotificationSchema.parse(body)

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

    // Get user settings
    const { data: userSettings } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

    // Prepare notification context
    const notificationContext = {
      userName: userSettings?.display_name || user.email?.split("@")[0] || "User",
      userEmail: user.email!,
      businessName: userSettings?.business_name,
      leadName: lead.name,
      leadEmail: lead.email,
      eventType: lead.event_type,
      eventDate: lead.event_date,
      dashboardUrl: `${request.nextUrl.origin}/dashboard/leads/${leadId}`,
    }

    let success = false

    switch (type) {
      case "new_lead":
        success = await sendNewLeadNotification(user.id, leadId, notificationContext)
        break
      case "status_change":
        if (!context?.oldStatus || !context?.newStatus) {
          return NextResponse.json(
            { error: "Old and new status required for status change notification" },
            { status: 400 },
          )
        }
        success = await sendStatusChangeNotification(
          user.id,
          leadId,
          context.oldStatus,
          context.newStatus,
          notificationContext,
        )
        break
      case "draft_generated":
        success = await sendDraftGeneratedNotification(user.id, leadId, context?.draftId || "", notificationContext)
        break
    }

    return NextResponse.json({
      success,
      message: success ? "Notification sent successfully" : "Failed to send notification",
    })
  } catch (error) {
    console.error("Error sending notification:", error)

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
        error: "Failed to send notification",
      },
      { status: 500 },
    )
  }
}
