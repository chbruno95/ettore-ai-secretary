import { createServerClient } from "@/lib/supabase/server"

export interface EmailNotification {
  to: string
  subject: string
  html: string
  text?: string
}

export interface NotificationContext {
  userName: string
  userEmail: string
  businessName?: string
  leadName?: string
  leadEmail?: string
  eventType?: string
  eventDate?: string
  dashboardUrl: string
}

// Email service interface - can be implemented with different providers
export interface EmailService {
  sendEmail(notification: EmailNotification): Promise<boolean>
}

// Simple email service using fetch (can be replaced with Resend, SendGrid, etc.)
class FetchEmailService implements EmailService {
  async sendEmail(notification: EmailNotification): Promise<boolean> {
    try {
      // This would integrate with your preferred email service
      // For now, we'll log the email (in production, use a real service)
      console.log("📧 Email Notification:", {
        to: notification.to,
        subject: notification.subject,
        preview: notification.text?.substring(0, 100) + "...",
      })

      // In production, replace with actual email service call:
      // const response = await fetch('https://api.resend.com/emails', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     from: 'Ettore <notifications@yourdomain.com>',
      //     to: notification.to,
      //     subject: notification.subject,
      //     html: notification.html,
      //   }),
      // })
      // return response.ok

      return true // Simulate success for development
    } catch (error) {
      console.error("Failed to send email:", error)
      return false
    }
  }
}

export const emailService = new FetchEmailService()

export async function sendNewLeadNotification(
  userId: string,
  leadId: string,
  context: NotificationContext,
): Promise<boolean> {
  try {
    const supabase = createServerClient()

    // Check user's notification preferences
    const { data: settings } = await supabase
      .from("user_settings")
      .select("email_notifications, notification_preferences")
      .eq("user_id", userId)
      .single()

    if (!settings?.email_notifications) {
      console.log("Email notifications disabled for user:", userId)
      return true // Not an error, just disabled
    }

    const emailHtml = generateNewLeadEmailHtml(context)
    const emailText = generateNewLeadEmailText(context)

    const notification: EmailNotification = {
      to: context.userEmail,
      subject: `🎉 New Lead: ${context.leadName} - ${context.eventType}`,
      html: emailHtml,
      text: emailText,
    }

    const success = await emailService.sendEmail(notification)

    // Log the email attempt
    await supabase.from("email_logs").insert({
      user_id: userId,
      lead_id: leadId,
      email_type: "new_lead",
      recipient: context.userEmail,
      subject: notification.subject,
      status: success ? "sent" : "failed",
      sent_at: new Date().toISOString(),
    })

    return success
  } catch (error) {
    console.error("Error sending new lead notification:", error)
    return false
  }
}

export async function sendStatusChangeNotification(
  userId: string,
  leadId: string,
  oldStatus: string,
  newStatus: string,
  context: NotificationContext,
): Promise<boolean> {
  try {
    const supabase = createServerClient()

    const { data: settings } = await supabase
      .from("user_settings")
      .select("email_notifications")
      .eq("user_id", userId)
      .single()

    if (!settings?.email_notifications) {
      return true
    }

    const emailHtml = generateStatusChangeEmailHtml(context, oldStatus, newStatus)
    const emailText = generateStatusChangeEmailText(context, oldStatus, newStatus)

    const notification: EmailNotification = {
      to: context.userEmail,
      subject: `📋 Lead Status Updated: ${context.leadName} - ${newStatus}`,
      html: emailHtml,
      text: emailText,
    }

    const success = await emailService.sendEmail(notification)

    await supabase.from("email_logs").insert({
      user_id: userId,
      lead_id: leadId,
      email_type: "status_change",
      recipient: context.userEmail,
      subject: notification.subject,
      status: success ? "sent" : "failed",
      sent_at: new Date().toISOString(),
    })

    return success
  } catch (error) {
    console.error("Error sending status change notification:", error)
    return false
  }
}

export async function sendDraftGeneratedNotification(
  userId: string,
  leadId: string,
  draftId: string,
  context: NotificationContext,
): Promise<boolean> {
  try {
    const supabase = createServerClient()

    const { data: settings } = await supabase
      .from("user_settings")
      .select("email_notifications")
      .eq("user_id", userId)
      .single()

    if (!settings?.email_notifications) {
      return true
    }

    const emailHtml = generateDraftGeneratedEmailHtml(context)
    const emailText = generateDraftGeneratedEmailText(context)

    const notification: EmailNotification = {
      to: context.userEmail,
      subject: `✨ AI Draft Ready: Response for ${context.leadName}`,
      html: emailHtml,
      text: emailText,
    }

    const success = await emailService.sendEmail(notification)

    await supabase.from("email_logs").insert({
      user_id: userId,
      lead_id: leadId,
      email_type: "draft_generated",
      recipient: context.userEmail,
      subject: notification.subject,
      status: success ? "sent" : "failed",
      sent_at: new Date().toISOString(),
    })

    return success
  } catch (error) {
    console.error("Error sending draft generated notification:", error)
    return false
  }
}

// Email template generators
function generateNewLeadEmailHtml(context: NotificationContext): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Lead Notification</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .lead-info { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .lead-info h3 { margin: 0 0 12px 0; color: #1f2937; font-size: 18px; }
        .info-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #6b7280; }
        .value { color: #1f2937; }
        .cta { text-align: center; margin: 32px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { background: #f8fafc; padding: 20px 24px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New Lead Received!</h1>
          <p>You have a new wedding inquiry</p>
        </div>
        
        <div class="content">
          <p>Hi ${context.userName},</p>
          <p>Great news! You've received a new lead through your website. Here are the details:</p>
          
          <div class="lead-info">
            <h3>Lead Information</h3>
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">${context.leadName}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${context.leadEmail}</span>
            </div>
            <div class="info-row">
              <span class="label">Event Type:</span>
              <span class="value">${context.eventType || "Not specified"}</span>
            </div>
            ${
              context.eventDate
                ? `
            <div class="info-row">
              <span class="label">Event Date:</span>
              <span class="value">${new Date(context.eventDate).toLocaleDateString()}</span>
            </div>
            `
                : ""
            }
          </div>
          
          <p>This lead is now available in your dashboard where you can:</p>
          <ul>
            <li>Generate AI-powered email responses</li>
            <li>Track lead status and progress</li>
            <li>Manage follow-up communications</li>
          </ul>
          
          <div class="cta">
            <a href="${context.dashboardUrl}" class="button">View Lead in Dashboard</a>
          </div>
          
          <p>Best regards,<br>The Ettore Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from Ettore AI Secretary</p>
          <p>You can manage your notification preferences in your dashboard settings</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateNewLeadEmailText(context: NotificationContext): string {
  return `
🎉 New Lead Received!

Hi ${context.userName},

Great news! You've received a new lead through your website.

Lead Information:
- Name: ${context.leadName}
- Email: ${context.leadEmail}
- Event Type: ${context.eventType || "Not specified"}
${context.eventDate ? `- Event Date: ${new Date(context.eventDate).toLocaleDateString()}` : ""}

This lead is now available in your dashboard where you can generate AI-powered email responses, track lead status, and manage follow-up communications.

View Lead: ${context.dashboardUrl}

Best regards,
The Ettore Team

---
This is an automated notification from Ettore AI Secretary.
You can manage your notification preferences in your dashboard settings.
  `.trim()
}

function generateStatusChangeEmailHtml(context: NotificationContext, oldStatus: string, newStatus: string): string {
  const statusEmojis: Record<string, string> = {
    new: "🆕",
    contacted: "📞",
    qualified: "✅",
    proposal: "📋",
    booked: "🎉",
    lost: "❌",
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lead Status Update</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .status-change { background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-weight: 600; margin: 0 8px; }
        .old-status { background: #f3f4f6; color: #6b7280; }
        .new-status { background: #10b981; color: white; }
        .arrow { font-size: 20px; margin: 0 12px; color: #10b981; }
        .cta { text-align: center; margin: 32px 0; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { background: #f8fafc; padding: 20px 24px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Lead Status Updated</h1>
          <p>Status change for ${context.leadName}</p>
        </div>
        
        <div class="content">
          <p>Hi ${context.userName},</p>
          <p>The status for your lead <strong>${context.leadName}</strong> has been updated:</p>
          
          <div class="status-change">
            <div>
              <span class="status-badge old-status">${statusEmojis[oldStatus] || ""} ${oldStatus}</span>
              <span class="arrow">→</span>
              <span class="status-badge new-status">${statusEmojis[newStatus] || ""} ${newStatus}</span>
            </div>
          </div>
          
          <p>You can view the full lead details and continue managing this opportunity in your dashboard.</p>
          
          <div class="cta">
            <a href="${context.dashboardUrl}" class="button">View Lead Details</a>
          </div>
          
          <p>Best regards,<br>The Ettore Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from Ettore AI Secretary</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateStatusChangeEmailText(context: NotificationContext, oldStatus: string, newStatus: string): string {
  return `
📋 Lead Status Updated

Hi ${context.userName},

The status for your lead ${context.leadName} has been updated:

${oldStatus} → ${newStatus}

You can view the full lead details and continue managing this opportunity in your dashboard.

View Lead: ${context.dashboardUrl}

Best regards,
The Ettore Team
  `.trim()
}

function generateDraftGeneratedEmailHtml(context: NotificationContext): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Draft Ready</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .ai-badge { background: #f3e8ff; color: #7c3aed; padding: 8px 16px; border-radius: 20px; font-weight: 600; display: inline-block; margin: 16px 0; }
        .cta { text-align: center; margin: 32px 0; }
        .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { background: #f8fafc; padding: 20px 24px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ AI Draft Ready!</h1>
          <p>Your personalized email response is ready</p>
        </div>
        
        <div class="content">
          <p>Hi ${context.userName},</p>
          
          <div class="ai-badge">🤖 AI Generated</div>
          
          <p>Great news! I've generated a personalized email draft for your lead <strong>${context.leadName}</strong>.</p>
          
          <p>The AI has crafted a professional response based on:</p>
          <ul>
            <li>Lead's specific requirements and message</li>
            <li>Your business information and services</li>
            <li>Best practices for wedding professional communications</li>
          </ul>
          
          <p>You can review, edit, and send the draft directly from your dashboard.</p>
          
          <div class="cta">
            <a href="${context.dashboardUrl}" class="button">Review & Send Draft</a>
          </div>
          
          <p>Best regards,<br>Your AI Assistant Ettore</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from Ettore AI Secretary</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateDraftGeneratedEmailText(context: NotificationContext): string {
  return `
✨ AI Draft Ready!

Hi ${context.userName},

Great news! I've generated a personalized email draft for your lead ${context.leadName}.

The AI has crafted a professional response based on the lead's specific requirements, your business information, and best practices for wedding professional communications.

You can review, edit, and send the draft directly from your dashboard.

Review Draft: ${context.dashboardUrl}

Best regards,
Your AI Assistant Ettore
  `.trim()
}
