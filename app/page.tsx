import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Home() {
  // Show diagnostic info if Supabase is not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Ettore AI Secretary</h1>
            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h2 className="text-lg font-semibold text-yellow-800 mb-4">Configuration Required</h2>
              <p className="text-yellow-700 mb-4">
                Supabase environment variables are not configured. Please add the following variables in your Vercel
                dashboard:
              </p>
              <ul className="text-sm text-yellow-600 space-y-1 mb-4">
                <li>• NEXT_PUBLIC_SUPABASE_URL</li>
                <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>• SUPABASE_SERVICE_ROLE_KEY</li>
              </ul>
              <p className="text-sm text-yellow-600">After adding the variables, redeploy your application.</p>
            </div>
            <div className="mt-6">
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 underline">
                Try Login Page Anyway
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Handle authentication errors (but not redirect errors)
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Ettore AI Secretary</h1>
            <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
              <h2 className="text-lg font-semibold text-red-800 mb-4">Authentication Error</h2>
              <p className="text-red-700 mb-4">There was an error connecting to the authentication service.</p>
              <p className="text-sm text-red-600">Error: {error.message}</p>
            </div>
            <div className="mt-6">
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 underline">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // If user exists, redirect to dashboard
  redirect("/dashboard")
}
