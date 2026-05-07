import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpendLens — AI Spend Audit for Startups",
  description: "Find out if you're overpaying for AI tools like Cursor, Claude, ChatGPT, and GitHub Copilot. Free instant audit, no login required.",
  openGraph: {
    title: "SpendLens — AI Spend Audit",
    description: "Find out if you're overpaying for AI tools. Free instant audit.",
    url: "https://spendlens.credex.rocks",
    siteName: "SpendLens by Credex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens — AI Spend Audit",
    description: "Find out if you're overpaying for AI tools. Free, no login.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
