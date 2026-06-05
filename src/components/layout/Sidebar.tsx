"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    ),
  },
  {
    label: "Profile Builder",
    href: "/profile",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
        />
      </svg>
    ),
  },
  {
    label: "Analyze Job",
    href: "/analyze",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    ),
  },
  {
    label: "Career Chat",
    href: "/chat",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
    ),
  },
  {
    label: "History",
    href: "/history",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
]

interface SidebarProps {
  userEmail: string | null
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed left-0 top-0 bottom-0 border-r border-border bg-surface z-40 transition-all duration-200",
          isCollapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Image
              src="/careerbrainlogo.png"
              alt="CareerBrain"
              width={28}
              height={28}
              className="shrink-0"
            />
            {!isCollapsed && (
              <span className="font-heading font-bold text-base text-text-primary truncate">
                CareerBrain
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto text-text-muted hover:text-text-secondary transition-colors shrink-0"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative",
                  isCollapsed && "justify-center px-2",
                  isActive
                    ? "text-accent-lime bg-accent-dim/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-accent-lime rounded-full" />
                )}
                <span className={cn("shrink-0", isActive && "text-accent-lime")}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="truncate font-medium">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User / logout */}
        <div className="px-2 pb-4 border-t border-border pt-4 space-y-1">
          {!isCollapsed && userEmail && (
            <p className="px-3 text-xs text-text-muted truncate mb-2">
              {userEmail}
            </p>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors disabled:opacity-50",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Sign out" : undefined}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            {!isCollapsed && (
              <span>{loggingOut ? "Signing out..." : "Sign out"}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <MobileHeader userEmail={userEmail} pathname={pathname} onLogout={handleLogout} />
    </>
  )
}

function MobileHeader({
  userEmail,
  pathname,
  onLogout,
}: {
  userEmail: string | null
  pathname: string
  onLogout: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="md:hidden">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Image src="/careerbrainlogo.png" alt="CareerBrain" width={24} height={24} />
          <span className="font-heading font-bold text-sm text-text-primary">
            CareerBrain
          </span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute left-0 top-14 bottom-0 w-64 bg-surface border-r border-border flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors relative",
                      isActive
                        ? "text-accent-lime bg-accent-dim/20"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-accent-lime rounded-full" />
                    )}
                    <span className={cn("shrink-0", isActive && "text-accent-lime")}>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="px-2 pb-6 border-t border-border pt-4 space-y-1">
              {userEmail && (
                <p className="px-3 text-xs text-text-muted truncate mb-2">{userEmail}</p>
              )}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
