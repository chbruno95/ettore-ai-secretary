"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Calendar, DollarSign, MapPin, Clock, Edit, Save, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  event_type: string
  event_date?: string
  budget?: string
  status: string
  message?: string
  source?: string
  created_at: string
}

interface LeadDetailsProps {
  lead: Lead
}

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  proposal: "bg-purple-100 text-purple-800",
  booked: "bg-emerald-100 text-emerald-800",
  lost: "bg-red-100 text-red-800",
}

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal Sent" },
  { value: "booked", label: "Booked" },
  { value: "lost", label: "Lost" },
]

export function LeadDetails({ lead: initialLead }: LeadDetailsProps) {
  const [lead, setLead] = useState(initialLead)
  const [isEditing, setIsEditing] = useState(false)
  const [editedStatus, setEditedStatus] = useState(lead.status)
  const [notes, setNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleStatusUpdate = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: editedStatus,
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update lead")
      }

      setLead({ ...lead, status: editedStatus })
      setIsEditing(false)
      setNotes("")

      toast({
        title: "Lead Updated",
        description: "Lead status has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating lead:", error)
      toast({
        title: "Error",
        description: "Failed to update lead. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const cancelEdit = () => {
    setEditedStatus(lead.status)
    setNotes("")
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{lead.name}</CardTitle>
              <CardDescription>Lead Details</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={statusColors[lead.status as keyof typeof statusColors]}>
                {statusOptions.find((s) => s.value === lead.status)?.label || lead.status}
              </Badge>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Status
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="font-medium mb-3">Contact Information</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.phone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Event Information */}
          <div>
            <h3 className="font-medium mb-3">Event Information</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{lead.event_type}</span>
              </div>
              {lead.event_date && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{new Date(lead.event_date).toLocaleDateString()}</span>
                </div>
              )}
              {lead.budget && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.budget}</span>
                </div>
              )}
              {lead.source && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Source: {lead.source}</span>
                </div>
              )}
            </div>
          </div>

          {lead.message && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-3">Original Message</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{lead.message}</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Status Management */}
          <div>
            <h3 className="font-medium mb-3">Status Management</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={editedStatus} onValueChange={setEditedStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
                  <Textarea
                    placeholder="Add notes about this status change..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleStatusUpdate} disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={cancelEdit} disabled={isUpdating}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Created {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
