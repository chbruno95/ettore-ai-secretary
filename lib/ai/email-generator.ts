import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { createServerClient } from "@/lib/supabase/server"

export interface EmailContext {
  leadName: string
  leadEmail: string
  eventType: string
  eventDate?: string
  budget?: string
  message?: string
  userBusinessName: string
  userName: string
  userServices: string[]
}

export interface EmailTemplate {
  id: string
  name: string
  type: "welcome" | "follow_up" | "proposal" | "availability" | "custom"
  prompt: string
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    type: "welcome",
    prompt: `Write a warm, professional welcome email for a wedding professional responding to a new lead. 

Context:
- Lead Name: {leadName}
- Event Type: {eventType}
- Event Date: {eventDate}
- Budget: {budget}
- Original Message: {message}
- Business Name: {userBusinessName}
- Professional Name: {userName}
- Services: {userServices}

The email should:
- Thank them for their inquiry
- Show enthusiasm about their event
- Briefly mention relevant services
- Suggest next steps (consultation, meeting, etc.)
- Be warm but professional
- Include a clear call-to-action

Keep it concise (2-3 paragraphs) and personalized.`,
  },
  {
    id: "follow_up",
    name: "Follow-up Email",
    type: "follow_up",
    prompt: `Write a friendly follow-up email for a wedding professional checking in with a lead.

Context:
- Lead Name: {leadName}
- Event Type: {eventType}
- Event Date: {eventDate}
- Business Name: {userBusinessName}
- Professional Name: {userName}

The email should:
- Reference their previous inquiry
- Check if they have any questions
- Offer to schedule a consultation
- Mention availability for their date
- Be helpful and not pushy
- Include contact information

Keep it brief and focused on being helpful.`,
  },
  {
    id: "availability",
    name: "Availability Check",
    type: "availability",
    prompt: `Write an email confirming availability for a wedding date.

Context:
- Lead Name: {leadName}
- Event Type: {eventType}
- Event Date: {eventDate}
- Business Name: {userBusinessName}
- Professional Name: {userName}
- Services: {userServices}

The email should:
- Confirm availability for their date
- Briefly outline services offered
- Suggest scheduling a consultation
- Mention next steps in the process
- Be professional and excited
- Include a clear call-to-action

Keep it professional and informative.`,
  },
]

export async function generateEmailDraft(
  context: EmailContext,
  templateType = "welcome",
  customPrompt?: string,
): Promise<{ content: string; subject: string }> {
  try {
    const template = DEFAULT_TEMPLATES.find((t) => t.type === templateType) || DEFAULT_TEMPLATES[0]

    // Replace placeholders in prompt
    let prompt = customPrompt || template.prompt
    prompt = prompt
      .replace(/{leadName}/g, context.leadName || "there")
      .replace(/{leadEmail}/g, context.leadEmail || "")
      .replace(/{eventType}/g, context.eventType || "wedding")
      .replace(/{eventDate}/g, context.eventDate || "your special day")
      .replace(/{budget}/g, context.budget || "your budget")
      .replace(/{message}/g, context.message || "")
      .replace(/{userBusinessName}/g, context.userBusinessName || "our business")
      .replace(/{userName}/g, context.userName || "the team")
      .replace(/{userServices}/g, context.userServices?.join(", ") || "our services")

    // Generate email content
    const { text: emailContent } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    // Generate subject line
    const { text: subject } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      prompt: `Generate a professional, engaging email subject line for this context:
      - Lead: ${context.leadName}
      - Event: ${context.eventType}
      - Business: ${context.userBusinessName}
      - Template type: ${templateType}
      
      The subject should be:
      - Professional but warm
      - Specific to their event
      - Under 50 characters
      - Engaging and personal
      
      Return only the subject line, no quotes or extra text.`,
      temperature: 0.8,
      maxTokens: 20,
    })

    return {
      content: emailContent.trim(),
      subject: subject.trim(),
    }
  } catch (error) {
    console.error("Error generating email draft:", error)
    throw new Error("Failed to generate email draft")
  }
}

export async function saveEmailDraft(
  userId: string,
  leadId: string,
  subject: string,
  content: string,
  templateType: string,
) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("email_drafts")
    .insert({
      user_id: userId,
      lead_id: leadId,
      subject,
      content,
      template_type: templateType,
      status: "draft",
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving email draft:", error)
    throw new Error("Failed to save email draft")
  }

  return data
}

export async function getEmailDrafts(userId: string, leadId?: string) {
  const supabase = createServerClient()

  let query = supabase
    .from("email_drafts")
    .select(`
      *,
      leads (
        name,
        email,
        event_type
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (leadId) {
    query = query.eq("lead_id", leadId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching email drafts:", error)
    throw new Error("Failed to fetch email drafts")
  }

  return data
}
