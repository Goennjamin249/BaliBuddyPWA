import { ScrollViewStyleReset } from "expo-router/html";
import { type ReactNode } from "react";

/**
 * iOS splash screen configurations
 */
interface SplashScreenConfig {
  deviceWidth: number;
  deviceHeight: number;
  pixelRatio: number;
  href: string;
  /** Device description for comments */
  description: string;
}

const SPLASH_SCREENS: SplashScreenConfig[] = [
  // iPhone 15 Pro Max / 14 Pro Max
  {
    deviceWidth: 430,
    deviceHeight: 932,
    pixelRatio: 3,
    href: "/splash/apple-splash-1290-2796.png",
    description: "iPhone 15 Pro Max / 14 Pro Max",
  },
  // iPhone 15 Pro / 14 Pro / 13 / 12
  {
    deviceWidth: 393,
    deviceHeight: 852,
    pixelRatio: 3,
    href: "/splash/apple-splash-1179-2556.png",
    description: "iPhone 15 Pro / 14 Pro / 13 / 12",
  },
  // iPhone 11 Pro Max / XS Max
  {
    deviceWidth: 414,
    deviceHeight: 896,
    pixelRatio: 3,
    href: "/splash/apple-splash-1242-2688.png",
    description: "iPhone 11 Pro Max / XS Max",
  },
  // iPhone 11 / XR
  {
    deviceWidth: 414,
    deviceHeight: 896,
    pixelRatio: 2,
    href: "/splash/apple-splash-828-1792.png",
    description: "iPhone 11 / XR",
  },
  // iPhone 8 / 7 / 6s / 6
  {
    deviceWidth: 375,
    deviceHeight: 667,
    pixelRatio: 2,
    href: "/splash/apple-splash-750-1334.png",
    description: "iPhone 8 / 7 / 6s / 6",
  },
  // iPhone 11 Pro / XS / X
  {
    deviceWidth: 375,
    deviceHeight: 812,
    pixelRatio: 3,
    href: "/splash/apple-splash-1125-2436.png",
    description: "iPhone 11 Pro / XS / X",
  },
  // iPad Pro 12.9"
  {
    deviceWidth: 1024,
    deviceHeight: 1366,
    pixelRatio: 2,
    href: "/splash/apple-splash-2048-2732.png",
    description: "iPad Pro 12.9\"",
  },
  // iPad Pro 11"
  {
    deviceWidth: 834,
    deviceHeight: 1194,
    pixelRatio: 2,
    href: "/splash/apple-splash-1668-2388.png",
    description: "iPad Pro 11\"",
  },
];

/**
 * External API domains for preconnect/dns-prefetch hints
 */
const EXTERNAL_API_DOMAINS = [
  "https://api.openweathermap.org",
  "https://api.frankfurter.app",
  "https://overpass-api.de",
] as const;

/**
 * Props for RootLayout component
 */
interface RootLayoutProps {
  children: ReactNode;
}

/**
 * HTML shell for web with PWA support, iOS splash screens, and performance optimizations
 */
export default function RootLayout({ children }: RootLayoutProps) {
  // Determine environment mode dynamically
  const isDevelopment = process.env.EXPO_ENV !== "production";

  return (
    <html lang="de">
      <head>
  
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.openweathermap.org https://api.frankfurter.app https://overpass-api.de"
        />

        {/* Viewport - iOS Safe Area Support */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* SEO Meta Tags */}
        <meta
          name="description"
          content="BaliBuddy - Dein Offline-Reiseführer für Bali mit Wetter, Wechselkursen, Notfallnummern und Gesetzen"
        />
        <meta
          name="keywords"
          content="Bali, Reiseführer, Offline, Wetter, Wechselkurs, Notfall, Gesetze"
        />
        <meta name="author" content="BaliBuddy" />

        {/* Open Graph / Social Sharing */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="BaliBuddy" />
        <meta
          property="og:description"
          content="Dein Offline-Reiseführer für Bali mit Wetter, Wechselkursen, Notfallnummern und Gesetzen"
        />
        <meta property="og:locale" content="de_DE" />

        {/* PWA Configuration */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="BaliBuddy" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FF9D6C" />

        {/* Favicon & Icons */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/assets/images/icon.png" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS Splash Screens */}
        {SPLASH_SCREENS.map(({ deviceWidth, deviceHeight, pixelRatio, href }) => (
          <link
            key={href}
            rel="apple-touch-startup-image"
            media={`screen and (device-width: ${deviceWidth}px) and (device-height: ${deviceHeight}px) and (-webkit-device-pixel-ratio: ${pixelRatio}) and (orientation: portrait)`}
            href={href}
          />
        ))}

        <ScrollViewStyleReset />

        {/* Preconnect & DNS Prefetch for External APIs */}
        {EXTERNAL_API_DOMAINS.map((domain) => (
          <link key={`preconnect-${domain}`} rel="preconnect" href={domain} />
        ))}
        {EXTERNAL_API_DOMAINS.map((domain) => (
          <link key={`dns-${domain}`} rel="dns-prefetch" href={domain} />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}