import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = { title: "Dave's To-Do", description: "Unified task inbox" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-line bg-panel">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-base font-semibold text-ink">
              Dave&apos;s To-Do
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="text-sub hover:text-ink">Inbox</Link>
              <Link href="/personal/new" className="text-sub hover:text-ink">New</Link>
              <Link href="/recurring" className="text-sub hover:text-ink">Recurring</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
