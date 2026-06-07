import type { Metadata } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic RAG Demo",
  description: "Interactive demonstrations of RAG and Agentic AI concepts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-300">
              Agentic RAG Interactive Demo
              <br />
              Built with Next.js, React, FastAPI, and Claude AI
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
