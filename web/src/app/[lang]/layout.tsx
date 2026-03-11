import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "../globals.css";
import { i18n, type Locale } from "../../i18n-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Omnigize | Enterprise CRM",
  description: "The ultimate omni-channel Business OS for modern financial institutions.",
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) as { lang: Locale };
  const isRtl = lang === "ar";
  const dir = isRtl ? "rtl" : "ltr";
  
  // Use Cairo for Arabic, Geist for English
  const fontVariable = isRtl ? cairo.variable : geistSans.variable;

  return (
    <html lang={lang} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${fontVariable} ${geistMono.variable} antialiased`}
        style={isRtl ? { fontFamily: 'var(--font-cairo), sans-serif' } : {}}
      >
        {children}
      </body>
    </html>
  );
}
