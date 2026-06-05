import type { Metadata } from "next"
import { SignupForm } from "./SignupForm"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Sign Up" }

export default function SignupPage() {
  return <SignupForm />
}
