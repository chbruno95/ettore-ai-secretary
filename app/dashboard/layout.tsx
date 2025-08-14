import type React from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Ettore</h2>
            <DashboardNav />
          </div>
          <div className="ml-auto">
            <UserNav user={user} />
          </div>
        </div>
      </div>
      <main className="container mx-auto py-8">{children}</main>
    </div>
  )
}
