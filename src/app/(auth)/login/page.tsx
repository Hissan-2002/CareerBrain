import type { Metadata } from "next"
import { LoginForm } from "./LoginForm"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Sign In" }

export default function LoginPage() {
  return <LoginForm />
}
