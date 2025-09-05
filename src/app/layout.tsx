import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '3D Car Racing Game - Professional Racing Experience',
  description: 'Experience the ultimate 3D car racing game with realistic physics, dynamic obstacles, and professional gameplay. Navigate through challenging courses and test your driving skills.',
  keywords: 'car racing, 3D game, racing simulator, obstacle course, driving game',
  authors: [{ name: 'Racing Game Studio' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#1a1a2e',
  openGraph: {
    title: '3D Car Racing Game',
    description: 'Professional 3D car racing with dynamic obstacles',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '3D Car Racing Game',
    description: 'Professional 3D car racing with dynamic obstacles',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen overflow-hidden`}>
        <div id="game-root" className="w-full h-screen relative">
          {children}
        </div>
        <div id="audio-context" className="hidden" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent context menu on right click for better game experience
              document.addEventListener('contextmenu', e => e.preventDefault());
              
              // Prevent zoom on mobile devices
              document.addEventListener('touchstart', function(e) {
                if (e.touches.length > 1) {
                  e.preventDefault();
                }
              }, { passive: false });
              
              // Prevent double-tap zoom
              let lastTouchEnd = 0;
              document.addEventListener('touchend', function(e) {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                  e.preventDefault();
                }
                lastTouchEnd = now;
              }, false);
              
              // Initialize audio context on first user interaction
              let audioInitialized = false;
              function initAudio() {
                if (!audioInitialized) {
                  const AudioContext = window.AudioContext || window.webkitAudioContext;
                  if (AudioContext) {
                    const audioContext = new AudioContext();
                    if (audioContext.state === 'suspended') {
                      audioContext.resume();
                    }
                    audioInitialized = true;
                  }
                }
              }
              
              document.addEventListener('click', initAudio, { once: true });
              document.addEventListener('touchstart', initAudio, { once: true });
              document.addEventListener('keydown', initAudio, { once: true });
            `,
          }}
        />
      </body>
    </html>
  )
}