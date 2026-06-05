"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { PipelineProgress, type PipelineStep, type StepStatus } from "./PipelineProgress"

const INITIAL_STEPS: PipelineStep[] = [
  { id: "upload", label: "Uploading CV", status: "pending" },
  { id: "extract", label: "Extracting text", status: "pending" },
  { id: "github", label: "Fetching GitHub data", status: "pending" },
  { id: "parse", label: "Parsing with AI", status: "pending" },
  { id: "embed", label: "Building embeddings", status: "pending" },
  { id: "save", label: "Saving to database", status: "pending" },
]

// Optimistic timing (ms) — how long before each step animates to "running"
const STEP_DELAYS = [0, 1500, 3000, 5000, 20000, 45000]

type BuildState = "idle" | "building" | "success" | "error"

export function BrainBuilder() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [buildState, setBuildState] = useState<BuildState>("idle")
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [githubUsername, setGithubUsername] = useState("")
  const [dragging, setDragging] = useState(false)

  const setStepStatus = useCallback(
    (id: string, status: StepStatus, errorMessage?: string) => {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status, errorMessage } : s
        )
      )
    },
    []
  )

  const handleFile = (file: File | null) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Only PDF files are supported.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File must be under 10 MB.")
      return
    }
    setErrorMsg(null)
    setSelectedFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0] ?? null
    handleFile(file)
  }

  async function handleBuild(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) {
      setErrorMsg("Please select a PDF file.")
      return
    }

    setBuildState("building")
    setErrorMsg(null)
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "pending" })))

    // Kick off optimistic step animations
    const timers: ReturnType<typeof setTimeout>[] = []
    INITIAL_STEPS.forEach((step, i) => {
      timers.push(
        setTimeout(() => setStepStatus(step.id, "running"), STEP_DELAYS[i])
      )
    })

    try {
      const formData = new FormData()
      formData.append("cv", selectedFile)
      if (githubUsername.trim()) {
        formData.append("githubUsername", githubUsername.trim())
      }

      const res = await fetch("/api/brain/build", {
        method: "POST",
        body: formData,
      })

      // Cancel pending optimistic timers
      timers.forEach(clearTimeout)

      const data = (await res.json()) as { success?: boolean; error?: string }

      if (!res.ok || !data.success) {
        const msg = data.error ?? "Brain build failed. Please try again."
        // Mark the currently "running" step as error
        setSteps((prev) => {
          const runningIdx = [...prev].reverse().findIndex((s) => s.status === "running")
          if (runningIdx === -1) return prev
          const actualIdx = prev.length - 1 - runningIdx
          return prev.map((s, i) =>
            i === actualIdx
              ? { ...s, status: "error", errorMessage: msg }
              : s
          )
        })
        setErrorMsg(msg)
        setBuildState("error")
        return
      }

      // Mark all steps as done
      setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "done" })))
      setBuildState("success")

      // Navigate to profile — forces server component to re-run and show ProfileCard
      setTimeout(() => router.push("/profile"), 1200)
    } catch (err) {
      timers.forEach(clearTimeout)
      const msg =
        err instanceof Error ? err.message : "Unexpected error during build."
      setErrorMsg(msg)
      setBuildState("error")
    }
  }

  if (buildState === "building" || buildState === "success") {
    return (
      <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-8">
        <h2 className="mb-6 font-display text-lg font-semibold text-foreground">
          {buildState === "success" ? "Brain built!" : "Building your brain…"}
        </h2>
        <PipelineProgress steps={steps} />
        {buildState === "success" && (
          <p className="mt-4 text-sm text-muted-foreground">
            Loading your profile…
          </p>
        )}
        {buildState === "building" && errorMsg && (
          <p className="mt-4 text-sm text-destructive">{errorMsg}</p>
        )}
      </div>
    )
  }

  return (
    <form
      onSubmit={handleBuild}
      className="mx-auto w-full max-w-md space-y-6"
    >
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload CV PDF"
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : selectedFile
              ? "border-green-500/50 bg-green-500/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <svg
            className="h-6 w-6 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        {selectedFile ? (
          <>
            <p className="text-sm font-medium text-foreground">
              {selectedFile.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB · Click to change
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">
              Drop your CV here or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF only, max 10 MB
            </p>
          </>
        )}
      </div>

      {/* GitHub username */}
      <div className="space-y-1.5">
        <label
          htmlFor="github-username"
          className="text-sm font-medium text-foreground"
        >
          GitHub username{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="github-username"
          type="text"
          value={githubUsername}
          onChange={(e) => setGithubUsername(e.target.value)}
          placeholder="e.g. torvalds"
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <p className="text-xs text-muted-foreground">
          Adds public project and contribution data to your brain.
        </p>
      </div>

      {/* Error */}
      {(errorMsg || buildState === "error") && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMsg ?? "Build failed. Please try again."}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!selectedFile}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Build My Career Brain
      </button>
    </form>
  )
}
