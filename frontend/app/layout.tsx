import type { Metadata } from "next";
import { Red_Hat_Display, Red_Hat_Text, Red_Hat_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
});
const text = Red_Hat_Text({
  subsets: ["latin"],
  variable: "--font-text",
  weight: ["400", "500", "700"],
  display: "swap",
});
const mono = Red_Hat_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Red Hat · Agentic RAG",
  description: "Interactive demonstrations of RAG and Agentic AI concepts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${text.variable} ${mono.variable}`}
    >
      <body className="min-h-screen font-sans text-ink antialiased">
        <Header />
        <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">{children}</main>
        <footer className="mt-20 border-t border-black/5 py-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-1 px-5 text-center sm:px-8">
            <p className="font-display text-sm font-semibold text-ink">
              Red Hat <span className="text-ink-muted font-normal">· Agentic RAG demo</span>
            </p>
            <p className="text-xs text-ink-muted">
              Built with Next.js, FastAPI, and pluggable LLMs (Claude · OpenAI · vLLM)
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
