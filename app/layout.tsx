import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import { SITE } from "@/content/sections";
import { OG_DEFAULTS, TWITTER_DEFAULTS } from "@/content/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Headline face. The deck used to set its titles in the same bold grotesk as
// the body, which is the house style of every other scroll-driven portfolio
// deck; a high-contrast serif against Geist Mono labels is the whole point of
// the type system. Ships one weight (400) — Instrument Serif has no others,
// and the size does the work, not the weight.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Root metadata holds metadataBase, the title template, the robots rule, and
// fallbacks for any route without its own metadata export.
//
// Everything page-specific — title, description, canonical, and the whole
// og:*/twitter:* set — is declared in each page's own `metadata` export via
// `pageMetadata`/`sectionMetadata`. Next merges metadata shallowly, so shared
// OG/Twitter defaults cannot be inherited from here; see content/metadata.ts.
// Inheriting them is what made every subpage emit the homepage's og:title,
// og:description and og:url.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.metaTitle,
    template: `%s, ${SITE.fullName}`,
  },
  description: SITE.metaDescription,
  // "./" resolves against metadataBase *per route*, so any route that does not
  // set its own canonical still emits a self-referencing one on the production
  // domain regardless of the host it was served from (workers.dev vs
  // sunnyavula.com).
  alternates: { canonical: "./" },
  openGraph: OG_DEFAULTS,
  twitter: TWITTER_DEFAULTS,
  robots: { index: true, follow: true },
};

// Dark-only site (see globals.css) — one theme color for both OS schemes so the
// mobile browser chrome matches the deck's backdrop instead of flashing white.
export const viewport: Viewport = {
  themeColor: "#10131c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:text-background"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
