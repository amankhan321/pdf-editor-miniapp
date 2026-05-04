import type { Metadata } from 'next'
import { Providers } from './components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'PDF Editor',
  description: 'Edit PDFs on Base — a Farcaster Mini App',
  other: {
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: 'https://YOURAPP.vercel.app/og-image.png',
      button: {
        title: 'Edit your PDF',
        action: {
          type: 'launch_miniapp',
          name: 'PDF Editor',
          url: 'https://YOURAPP.vercel.app',
          splashImageUrl: 'https://YOURAPP.vercel.app/splash.png',
          splashBackgroundColor: '#030712',
        },
      },
    }),
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}