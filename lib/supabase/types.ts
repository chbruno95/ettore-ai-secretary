export interface User {
  id: string
  email: string
  full_name?: string
  business_name?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
  event_date?: string
  event_type?: string
  budget_range?: string
  message?: string
  status: "new" | "contacted" | "qualified" | "proposal_sent" | "won" | "lost"
  source?: string
  priority: "low" | "medium" | "high"
  notes?: string
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  id: string
  user_id: string
  name: string
  subject: string
  content: string
  template_type: "welcome" | "follow_up" | "proposal" | "custom"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EmailDraft {
  id: string
  user_id: string
  lead_id: string
  subject: string
  content: string
  template_used?: string
  is_sent: boolean
  sent_at?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  lead_id?: string
  type: "new_lead" | "follow_up_reminder" | "email_sent" | "system"
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  email_notifications: boolean
  auto_follow_up_days: number
  business_hours_start: string
  business_hours_end: string
  timezone: string
  webhook_url?: string
  openai_api_key?: string
  email_signature?: string
  created_at: string
  updated_at: string
}
