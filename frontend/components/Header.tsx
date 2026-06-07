"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

function RedHatMark() {
  // Stylized fedora mark (not the official trademarked lockup).
  return (
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand shadow-[0_4px_14px_-4px_rgba(238,0,0,0.6)]">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <ellipse cx="12" cy="15.6" rx="9" ry="2.7" fill="white" />
        <path d="M7.4 15.2C7.4 9.6 9 7 12 7s4.6 2.6 4.6 8.2Z" fill="white" />
      </svg>
    </span>
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="glass sticky top-0 z-50 border-b border-black/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <RedHatMark />
          <span className="flex items-baseline gap-2">
            <span className="font-display text-lg font-extrabold tracking-tight text-ink">
              Red Hat
            </span>
            <span className="hidden text-ink-muted sm:inline">·</span>
            <span className="hidden font-display text-lg font-medium text-ink-muted sm:inline">
              Agentic RAG
            </span>
          </span>
        </Link>

        {!isHome && (
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm font-medium text-ink transition hover:bg-black/[0.04]"
          >
            <ChevronLeft className="h-4 w-4" />
            Demos
          </button>
        )}
      </div>
    </header>
  );
}
