import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Test endpoint to verify webhook functionality
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, api_key } = body

    if (!user_id || !api_key) {
      return NextResponse.json({ error: "user_id and api_key are required for testing" }, { status: 400 })
    }

    const supabase = createClient()

    // Verify the user exists
    const { data: userSettings, error } = await supabase
      .from("user_settings")
      .select("user_id")
      .eq("user_id", user_id)
      .single()

    if (error || !userSettings) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 401 })
    }

    // Create a test lead
    const testLead = {
      name: "Test Lead",
      email: "test@example.com",
      phone: "+1234567890",
      event_date: "2024-12-31",
      event_type: "wedding",
      budget_range: "$5000-$10000",
      message: "This is a test lead created via webhook",
      source: "webhook_test",
      user_id,
      api_key,
    }

    // Call the actual webhook endpoint
    const webhookResponse = await fetch(`${request.nextUrl.origin}/api/webhook/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testLead),
    })

    const result = await webhookResponse.json()

    return NextResponse.json({
      test_successful: webhookResponse.ok,
      webhook_response: result,
      test_payload: testLead,
    })
  } catch (error) {
    console.error("Test webhook error:", error)
    return NextResponse.json(
      { error: "Test failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
