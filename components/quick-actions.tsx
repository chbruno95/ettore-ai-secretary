import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wand2, Users, Settings, Webhook } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Generate Email Draft",
      description: "Create AI-powered responses",
      icon: Wand2,
      href: "/dashboard/leads",
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    },
    {
      title: "Add New Lead",
      description: "Manually add a lead",
      icon: Users,
      href: "/dashboard/leads/new",
      color: "bg-green-50 text-green-600 hover:bg-green-100",
    },
    {
      title: "Setup Webhook",
      description: "Connect your website",
      icon: Webhook,
      href: "/dashboard/webhooks",
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
    {
      title: "Configure Settings",
      description: "Update your preferences",
      icon: Settings,
      href: "/dashboard/settings",
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button key={index} variant="outline" className="h-auto p-4 flex-col items-start bg-transparent" asChild>
              <Link href={action.href}>
                <div className={`p-2 rounded-md mb-2 ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
