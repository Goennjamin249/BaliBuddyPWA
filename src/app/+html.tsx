import { type ReactNode } from "react";
import { ScrollViewStyleReset } from "expo-router/html";

/**
 * iOS splash screen configurations
 */
interface SplashScreenConfig {
  deviceWidth: number;
  deviceHeight: number;
  pixelRatio: number;
  href: string;
}

const SPLASH_SCREENS: SplashScreenConfig[] = [
  {
    deviceWidth: 430,
    deviceHeight: 932,
    pixelRatio: 3,
    href: "/splash/apple-splash-1290-2796.png",
  },
  {
    deviceWidth: 393,
    deviceHeight: 852,
    pixelRatio: 3,
    href: "/splash/apple-splash-1179-2556.png",
  },
  {
    deviceWidth: 414,
    deviceHeight: 896,
    pixelRatio: 3,
    href: "/splash/apple-splash-1242-2688.png",
  },
  {
    deviceWidth: 414,
    deviceHeight: 896,
    pixelRatio: 2,
    href: "/splash/apple-splash-828-1792.png",
  },
  {
    deviceWidth: 375,
    deviceHeight: 667,
    pixelRatio: 2,
    href: "/splash/apple-splash-750-1334.png",
  },
  {
    deviceWidth: 375,
    deviceHeight: 812,
    pixelRatio: 3,
    href: "/splash/apple-splash-1125-2436.png",
  },
  {
    deviceWidth: 1024,
    deviceHeight: 1366,
    pixelRatio: 2,
    href: "/splash/apple-splash-2048-2732.png",
  },
  {
    deviceWidth: 834,
    deviceHeight: 1194,
    pixelRatio: 2,
    href: "/splash/apple-splash-1668-2388.png",
  },
];

const EXTERNAL_API_DOMAINS = [
  "https://api.openweathermap.org",
  "https://api.frankfurter.app",
  "https://overpass-api.de",
  "https://api.mapbox.com",
  "https://events.mapbox.com",
  "https://balibuddy.vercel.app", // Deine Vercel Domain für Serverless Functions
] as const;

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Mapbox CSS */}
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
          rel="stylesheet"
        />

        {/* Security Policy */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com; style-src 'self' 'unsafe-inline' https://api.mapbox.com; img-src 'self' data: https: blob:; connect-src 'self' https: wss: blob: https://*.vercel.app; worker-src 'self' blob:; child-src 'self' blob:;"
        />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, shrink-to-fit=no, viewport-fit=cover"
        />

        <meta
          name="description"
          content="BaliBuddy - Dein Offline-Reiseführer für Bali"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#FF9D6C" />

        {/* Icons – Expo Router served from assets */}
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />

        {/* iOS Splash Screens */}
        {SPLASH_SCREENS.map(
          ({ deviceWidth, deviceHeight, pixelRatio, href }) => (
            <link
              key={href}
              rel="apple-touch-startup-image"
              media={`screen and (device-width: ${deviceWidth}px) and (device-height: ${deviceHeight}px) and (-webkit-device-pixel-ratio: ${pixelRatio}) and (orientation: portrait)`}
              href={href}
            />
          ),
        )}

        <ScrollViewStyleReset />

        {/* Performance Hints */}
        {EXTERNAL_API_DOMAINS.map((domain) => (
          <link key={`preconnect-${domain}`} rel="preconnect" href={domain} />
        ))}
        {/* DNS-Prefetch als Backup für Vercel */}
        <link rel="dns-prefetch" href="https://balibuddy.vercel.app" />
      </head>
      <body>{children}</body>
    </html>
  );
}
