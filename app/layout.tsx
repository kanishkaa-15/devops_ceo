import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { DataProvider } from '@/context/DataContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'School CEO Dashboard',
  description: 'Executive dashboard for school administration and analytics',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const isGoogleConfigured = googleClientId && googleClientId !== 'your_google_client_id_here'

  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {isGoogleConfigured ? (
          <GoogleOAuthProvider clientId={googleClientId!}>
            <DataProvider>
              {children}
              <Toaster />
            </DataProvider>
          </GoogleOAuthProvider>
        ) : (
          <DataProvider>
            {children}
            <Toaster />
          </DataProvider>
        )}
        <Analytics />
      </body>
    </html>
  )
}
