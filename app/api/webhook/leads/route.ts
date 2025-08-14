import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

// Validation schema for incoming lead data
const leadSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  event_date: z.string().optional(),
  event_type: z.string().optional(),
  budget_range: z.string().optional(),
  message: z.string().optional(),
  source: z.string().optional().default("webhook"),
  user_id: z.string().uuid("Valid user ID is required"),
  api_key: z.string().min(1, "API key is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the incoming data
    const validatedData = leadSchema.parse(body)

    const supabase = createClient()

    // Verify the API key belongs to the user
    const { data: userSettings, error: settingsError } = await supabase
      .from("user_settings")
      .select("user_id, webhook_url, display_name, business_name")
      .eq("user_id", validatedData.user_id)
      .single()

    if (settingsError || !userSettings) {
      return NextResponse.json({ error: "Invalid user ID or user not found" }, { status: 401 })
    }

    // Create the lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        user_id: validatedData.user_id,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        event_date: validatedData.event_date,
        event_type: validatedData.event_type,
        budget_range: validatedData.budget_range,
        message: validatedData.message,
        source: validatedData.source,
        status: "new",
        priority: "medium",
      })
      .select()
      .single()

    if (leadError) {
      console.error("Error creating lead:", leadError)
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
    }

    // Create a notification for the new lead
    const { error: notificationError } = await supabase.from("notifications").insert({
      user_id: validatedData.user_id,
      lead_id: lead.id,
      type: "new_lead",
      title: "New Lead Received",
      message: `New lead from ${validatedData.name} (${validatedData.email})`,
      is_read: false,
    })

    if (notificationError) {
      console.error("Error creating notification:", notificationError)
      // Don't fail the request if notification creation fails
    }

    try {
      // Get user details for email notification
      const { data: user } = await supabase.auth.admin.getUserById(validatedData.user_id)

      if (user?.user && userSettings) {
        const { sendNewLeadNotification } = await import("@/lib/email/notification-service")

        const notificationContext = {
          userName: userSettings.display_name || user.user.email?.split("@")[0] || "User",
          userEmail: user.user.email!,
          businessName: userSettings.business_name,
          leadName: validatedData.name,
          leadEmail: validatedData.email,
          eventType: validatedData.event_type,
          eventDate: validatedData.event_date,
          dashboardUrl: `${request.nextUrl.origin}/dashboard/leads/${lead.id}`,
        }

        await sendNewLeadNotification(validatedData.user_id, lead.id, notificationContext)
      }
    } catch (emailError) {
      console.error("Failed to send new lead email notification:", emailError)
      // Don't fail the webhook if email fails
    }

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      message: "Lead created successfully",
    })
  } catch (error) {
    console.error("Webhook error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Handle GET requests to provide webhook information
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("user_id")

  if (!userId) {
    return NextResponse.json({ error: "user_id parameter is required" }, { status: 400 })
  }

  return NextResponse.json({
    webhook_url: `${request.nextUrl.origin}/api/webhook/leads`,
    method: "POST",
    required_fields: ["name", "email", "user_id", "api_key"],
    optional_fields: ["phone", "event_date", "event_type", "budget_range", "message", "source"],
    example_payload: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567890",
      event_date: "2024-06-15",
      event_type: "wedding",
      budget_range: "$5000-$10000",
      message: "Looking for wedding photography services",
      source: "website_contact_form",
      user_id: userId,
      api_key: "your_api_key_here",
    },
  })
}
