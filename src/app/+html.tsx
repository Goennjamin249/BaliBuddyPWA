import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Minimal HTML shell for web with proper DOCTYPE to avoid Quirks Mode
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Quirks_Mode_and_Standards_Mode
 */
export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no" />
        
        {/* PWA Fullscreen - Hide Safari UI */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BaliBuddy" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FF9D6C" />
        
        <ScrollViewStyleReset />
        
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://api.open-meteo.com" />
        <link rel="preconnect" href="https://overpass-api.de" />
        <link rel="preconnect" href="https://overpass.private.coffee" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
