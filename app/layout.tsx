import type { Metadata } from 'next'
import { Providers } from './components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'PDF Editor',
  description: 'Edit PDFs on Base — a Farcaster Mini App',
  other: {
    'base:app_id': '69f850a62e85d572ceed4c8d',
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: 'https://pdf-editor-miniapp.vercel.app/og-image.png',
      button: {
        title: 'Edit your PDF',
        action: {
          type: 'launch_miniapp',
          name: 'PDF Editor',
          url: 'https://pdf-editor-miniapp.vercel.app/',
          splashImageUrl: 'https://pdf-editor-miniapp.vercel.app/splash.png',
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