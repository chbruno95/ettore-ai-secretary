import { createClient } from "@/lib/supabase/server"

export interface WebhookLeadData {
  name: string
  email: string
  phone?: string
  event_date?: string
  event_type?: string
  budget_range?: string
  message?: string
  source?: string
}

export async function generateWebhookUrl(userId: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return `${baseUrl}/api/webhook/leads`
}

export async function generateApiKey(userId: string): Promise<string> {
  // Generate a secure API key for the user
  const timestamp = Date.now().toString()
  const randomString = Math.random().toString(36).substring(2, 15)
  return `ettore_${userId.substring(0, 8)}_${timestamp}_${randomString}`
}

export async function validateWebhookData(data: any): Promise<{
  isValid: boolean
  errors: string[]
  sanitizedData?: WebhookLeadData
}> {
  const errors: string[] = []

  // Required fields validation
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Name is required and must be a non-empty string")
  }

  if (!data.email || typeof data.email !== "string") {
    errors.push("Email is required and must be a string")
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      errors.push("Email must be a valid email address")
    }
  }

  // Optional fields validation
  if (data.phone && typeof data.phone !== "string") {
    errors.push("Phone must be a string if provided")
  }

  if (data.event_date && typeof data.event_date !== "string") {
    errors.push("Event date must be a string if provided")
  }

  if (data.event_type && typeof data.event_type !== "string") {
    errors.push("Event type must be a string if provided")
  }

  if (data.budget_range && typeof data.budget_range !== "string") {
    errors.push("Budget range must be a string if provided")
  }

  if (data.message && typeof data.message !== "string") {
    errors.push("Message must be a string if provided")
  }

  if (data.source && typeof data.source !== "string") {
    errors.push("Source must be a string if provided")
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  // Sanitize and return clean data
  const sanitizedData: WebhookLeadData = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim(),
    event_date: data.event_date?.trim(),
    event_type: data.event_type?.trim(),
    budget_range: data.budget_range?.trim(),
    message: data.message?.trim(),
    source: data.source?.trim() || "webhook",
  }

  return { isValid: true, errors: [], sanitizedData }
}

export async function createLeadFromWebhook(userId: string, leadData: WebhookLeadData) {
  const supabase = createClient()

  // Create the lead
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      user_id: userId,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      event_date: leadData.event_date,
      event_type: leadData.event_type,
      budget_range: leadData.budget_range,
      message: leadData.message,
      source: leadData.source,
      status: "new",
      priority: "medium",
    })
    .select()
    .single()

  if (leadError) {
    throw new Error(`Failed to create lead: ${leadError.message}`)
  }

  // Create notification
  const { error: notificationError } = await supabase.from("notifications").insert({
    user_id: userId,
    lead_id: lead.id,
    type: "new_lead",
    title: "New Lead Received",
    message: `New lead from ${leadData.name} (${leadData.email})`,
    is_read: false,
  })

  if (notificationError) {
    console.error("Failed to create notification:", notificationError)
    // Don't throw error for notification failure
  }

  return lead
}
