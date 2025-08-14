import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Mail } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Lead {
  id: string
  name: string
  email: string
  event_type: string
  event_date?: string
  status: string
  created_at: string
}

interface RecentLeadsProps {
  leads: Lead[]
}

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  proposal: "bg-purple-100 text-purple-800",
  booked: "bg-emerald-100 text-emerald-800",
  lost: "bg-red-100 text-red-800",
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Leads</CardTitle>
        <CardDescription>Your latest wedding inquiries</CardDescription>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No leads yet</p>
            <p className="text-sm">New leads will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{lead.name}</h4>
                    <Badge variant="secondary" className={statusColors[lead.status as keyof typeof statusColors]}>
                      {lead.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{lead.event_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/leads/${lead.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            {leads.length >= 5 && (
              <div className="text-center pt-4">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/leads">View All Leads</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
