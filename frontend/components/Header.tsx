"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

// Drop the official Red Hat logo asset at this path (see public/brand/README.md).
// We never recreate the logo — until the asset exists, a text wordmark is shown.
const LOGO_SRC = "/brand/redhat-logo.svg";

function BrandLockup() {
  // Preload the asset; only render the <img> once it actually loads, so a missing
  // logo never shows a broken-image icon.
  const [hasLogo, setHasLogo] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setHasLogo(true);
    img.onerror = () => setHasLogo(false);
    img.src = LOGO_SRC;
  }, []);

  return (
    <Link href="/" className="flex items-center gap-3">
      {hasLogo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={LOGO_SRC} alt="Red Hat" className="h-8 w-auto" />
      )}
      <span
        className={
          hasLogo
            ? "font-display text-lg font-medium text-ink-muted"
            : "font-display text-lg font-extrabold tracking-tight text-ink"
        }
      >
        Agentic RAG
      </span>
    </Link>
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="glass sticky top-0 z-50 border-b border-black/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        <BrandLockup />

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
