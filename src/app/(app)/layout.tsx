import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/Sidebar"

export const dynamic = "force-dynamic"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userEmail={user.email ?? null} />

      {/* Main content — offset for desktop sidebar */}
      <main className="md:pl-60 pt-14 md:pt-0 transition-all duration-200">
        <div className="min-h-screen p-6">{children}</div>
      </main>
    </div>
  )
}
