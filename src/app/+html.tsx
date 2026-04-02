import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * HTML shell for web with PWA support, iOS splash screens, and performance optimizations
 */
export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Viewport - iOS Safe Area Support */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no, viewport-fit=cover" />
        
        {/* SEO Meta Tags */}
        <meta name="description" content="BaliBuddy - Dein Offline-Reiseführer für Bali mit Wetter, Wechselkursen, Notfallnummern und Gesetzen" />
        <meta name="keywords" content="Bali, Reiseführer, Offline, Wetter, Wechselkurs, Notfall, Gesetze" />
        
        {/* PWA Fullscreen - Hide Safari UI */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BaliBuddy" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FF9D6C" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/assets/images/icon.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* iOS Splash Screens - Unique entries only */}
        {/* iPhone 15 Pro Max / 14 Pro Max */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/apple-splash-1290-2796.png" />
        {/* iPhone 15 Pro / 14 Pro / 13 / 12 */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/apple-splash-1179-2556.png" />
        {/* iPhone 11 Pro Max / XS Max */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/apple-splash-1242-2688.png" />
        {/* iPhone 11 / XR */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/apple-splash-828-1792.png" />
        {/* iPhone 8 / 7 / 6s / 6 */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/apple-splash-750-1334.png" />
        {/* iPhone 11 Pro / XS / X */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/apple-splash-1125-2436.png" />
        {/* iPad Pro 12.9" */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/apple-splash-2048-2732.png" />
        {/* iPad Pro 11" */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/apple-splash-1668-2388.png" />
        
        <ScrollViewStyleReset />
        
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://api.openweathermap.org" />
        <link rel="preconnect" href="https://api.frankfurter.app" />
        <link rel="preconnect" href="https://overpass-api.de" />
        <link rel="dns-prefetch" href="https://api.openweathermap.org" />
        <link rel="dns-prefetch" href="https://api.frankfurter.app" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
