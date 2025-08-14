import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Mail, Clock, TrendingUp } from "lucide-react"

interface DashboardOverviewProps {
  stats: {
    totalLeads: number
    newLeads: number
    totalDrafts: number
  }
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const cards = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      description: "All time leads",
      icon: Users,
      trend: "+12% from last month",
    },
    {
      title: "New Leads",
      value: stats.newLeads,
      description: "Awaiting response",
      icon: Clock,
      trend: "+5 this week",
    },
    {
      title: "Email Drafts",
      value: stats.totalDrafts,
      description: "AI generated",
      icon: Mail,
      trend: "Ready to send",
    },
    {
      title: "Response Rate",
      value: "87%",
      description: "Lead engagement",
      icon: TrendingUp,
      trend: "+3% improvement",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
            <p className="text-xs text-green-600 mt-1">{card.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
