import type { Metadata } from "next"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { CareerProfile } from "@/lib/types"
import { BrainBuilder } from "@/components/brain/BrainBuilder"
import { ProfileCard } from "@/components/brain/ProfileCard"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Career Brain" }

interface ProfilePageProps {
  searchParams: Promise<{ rebuild?: string }>
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const { rebuild } = await searchParams
  const forceRebuild = rebuild === "1"

  const supabase = await createSupabaseServerClient()

  const { data: profileRow } = await supabase
    .from("career_profiles")
    .select("structured_json, completeness_score, github_username, updated_at")
    .single()

  const hasProfile = !!profileRow?.structured_json && !forceRebuild
  const profile = profileRow?.structured_json as CareerProfile | null
  const completenessScore = profileRow?.completeness_score ?? 0

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Career Brain
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasProfile
            ? "Your structured career intelligence, kept up to date."
            : "Upload your CV to extract your career profile and build your knowledge base."}
        </p>
      </header>

      {hasProfile && profile ? (
        <ProfileCard profile={profile} completenessScore={completenessScore} />
      ) : (
        <BrainBuilder />
      )}
    </div>
  )
}
