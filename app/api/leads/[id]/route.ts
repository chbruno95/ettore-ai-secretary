import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendStatusChangeNotification } from "@/lib/email/notification-service"
import { z } from "zod"

const updateLeadSchema = z.object({
  status: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    const updates = updateLeadSchema.parse(body)

    // Get current lead to check for status changes
    const { data: currentLead, error: currentLeadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (currentLeadError || !currentLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Update the lead
    const { data: updatedLead, error: updateError } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating lead:", updateError)
      return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
    }

    // If status changed, send notification and create activity log
    if (updates.status && updates.status !== currentLead.status) {
      // Create activity log
      await supabase.from("lead_activities").insert({
        lead_id: params.id,
        user_id: user.id,
        activity_type: "status_change",
        description: `Status changed from ${currentLead.status} to ${updates.status}`,
        metadata: {
          old_status: currentLead.status,
          new_status: updates.status,
          notes: updates.notes,
        },
      })

      // Create notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        lead_id: params.id,
        type: "status_change",
        title: "Lead Status Updated",
        message: `${currentLead.name} status changed to ${updates.status}`,
        is_read: false,
      })

      // Send email notification if enabled
      try {
        const { data: userSettings } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

        const notificationContext = {
          userName: userSettings?.display_name || user.email?.split("@")[0] || "User",
          userEmail: user.email!,
          businessName: userSettings?.business_name,
          leadName: currentLead.name,
          leadEmail: currentLead.email,
          eventType: currentLead.event_type,
          eventDate: currentLead.event_date,
          dashboardUrl: `${request.nextUrl.origin}/dashboard/leads/${params.id}`,
        }

        await sendStatusChangeNotification(user.id, params.id, currentLead.status, updates.status, notificationContext)
      } catch (emailError) {
        console.error("Failed to send status change email:", emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    })
  } catch (error) {
    console.error("Error updating lead:", error)

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
        error: "Failed to update lead",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get lead details with activities
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select(`
        *,
        lead_activities (
          id,
          activity_type,
          description,
          created_at,
          metadata
        )
      `)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      lead,
    })
  } catch (error) {
    console.error("Error fetching lead:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch lead",
      },
      { status: 500 },
    )
  }
}
