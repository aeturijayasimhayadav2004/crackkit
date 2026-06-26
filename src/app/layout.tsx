import type { Metadata } from "next";
import { Inter, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { GuestBanner } from "@/components/GuestBanner";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://crackkit.vercel.app'),
  title: {
    default: 'CrackKit — Crack Every Interview. Master Every Skill.',
    template: '%s | CrackKit',
  },
  description: 'Premium study PDFs for DSA, Web Dev, System Design and more. Instant download. Indian prices from Rs.199.',
  keywords: ['DSA notes PDF India', 'interview prep PDF download', 'MERN stack notes', 'system design PDF', 'coding interview India'],
  openGraph: {
    title: 'CrackKit — Crack Every Interview. Master Every Skill.',
    description: 'Premium study PDFs. Instant download. Indian prices from Rs.199.',
    url: 'https://crackkit.vercel.app',
    siteName: 'CrackKit',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CrackKit',
    description: 'Premium study PDFs. Instant download. Indian prices from Rs.199.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-background text-text-primary" suppressHydrationWarning>
        <AuthProvider>
          <GuestBanner />
          <Navbar />
          <main className="flex-grow flex flex-col" suppressHydrationWarning>
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#13131A',
              color: '#FFFFFF',
              border: '1px solid #1E1E2E',
            },
            success: {
              iconTheme: {
                primary: '#00D68F',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF4757',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
