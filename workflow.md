# Architekturanalyse und Wissensdatenbank: Expo, Uniwind & HeroUI Native für iOS-optimierte PWAs

> **Stand:** April 2026 | **Projekt:** BaliBuddy PWA | **Stack:** Expo SDK 55, React Native 0.83, React 19.2

---

## 1. Einleitung und der Shift zu Expo SDK 55

Die Entwicklung von "Universal Apps" hat mit der Einführung von Expo SDK 55, React Native 0.83 und React 19.2 einen historischen Reifegrad erreicht. Die sogenannte "New Architecture" (Fabric Renderer, TurboModules) ist nun der unwiderrufliche Standard, die alte Architektur wurde offiziell fallengelassen.

Für Entwickler und KI-Agenten, die sich auf das Apple iOS-Ökosystem und Progressive Web Apps (PWAs) fokussieren, bringt dieser Stack enorme Möglichkeiten, aber auch hochkomplexe plattformspezifische Fallstricke mit sich. Dieses Dokument ist die definitive Wissensdatenbank, um die Brücke zwischen nativer iOS-Performance und webbasierter PWA-Flexibilität zu schlagen, angetrieben von Uniwind (Tailwind CSS v4) und HeroUI Native.

---

## 2. Die moderne Expo-Architektur (SDK 55 & Router v7)

Das Expo-Ökosystem eliminiert die Notwendigkeit, nativen Code (`/ios` und `/android`) manuell zu verwalten. Dies geschieht durch "Continuous Native Generation" (CNG).

### 2.1 Expo Router v7 und Native Navigation

Expo Router v7 führt native Navigations-APIs tief in das dateibasierte Routing ein. Ein herausragendes Feature für iOS-Applikationen sind die neuen Liquid Glass Tabs und die Stack Toolbar API.

Anstatt auf Web-basierte JavaScript-Navigation zurückzugreifen, nutzt Expo Router v7 auf iOS nun echte systemnative Komponenten. Die `<NativeTabs>`-Komponente ermöglicht den typischen, verschwommenen Apple-Transparenzeffekt (Liquid Glass) out-of-the-box.

### 2.2 Die `use dom` Direktive für Web-Interoperabilität

Ein revolutionäres Feature für PWAs und hybride Apps ist die `"use dom"`-Direktive. Diese erlaubt es, komplexen Web-Code (wie z. B. D3.js, Recharts oder WebGL) direkt in einer nativen App innerhalb einer extrem performanten, synchronisierten WebView auszuführen, während der Code im Web (PWA) nativ als DOM-Knoten gerendert wird.

> **Wichtig:** Wenn `use dom` verwendet wird, muss globales CSS explizit in der betroffenen Datei importiert werden, da isolierte DOM-Komponenten den globalen Kontext der Root-App nicht teilen.

### 2.3 SEO und Static Site Generation (SSG)

Für PWAs ist SEO (Search Engine Optimization) essenziell. Expo Router unterstützt die Generierung von statischem HTML (`output: "static"` in der `app.json`).

- **Dynamische Routen:** Bei Dateien wie `app/blog/[id].tsx` weiß der Bundler zur Build-Zeit nicht, welche IDs existieren. Hier greift die Funktion `generateStaticParams()`. Sie wird im Node.js-Kontext ausgeführt und retourniert ein Array aller Parameter, für die physische HTML-Dateien gerendert werden sollen.
- **Sitemaps:** Expo generiert bei statischem Output automatisch eine `/_sitemap`-Route, welche alle navigierbaren Pfade für Crawler auflistet.

---

## 3. Styling & UI-Architektur: Thomino Design, Uniwind und HeroUI Native

Die Ära von mühsamen `StyleSheet.create` und fragilen UI-Kits ist vorbei. Die moderne Architektur basiert auf den Prinzipien von Thomino Design, umgesetzt mit Uniwind und HeroUI Native.

### 3.1 Die "Thomino Design" Philosophie

Die Design-Sprache basiert auf einer radikalen Prämisse: **"Skip Figma. Design directly in code."** Durch die Kombination von Expo, Uniwind und Fast Refresh entfällt der klassische Design-Prototyping-Schritt.

Die Design-Sprache zeichnet sich aus durch:

- **Wiederverwendbare Layouts:** Onboarding-Flows, Multi-Step-Formulare und komplexe Checkout-Logiken sind als universelle Bausteine konzipiert.
- **Strikter Dark/Light Mode Dualismus:** Jede Komponente, jeder Schatten und jede Schriftfarbe besitzt von Beginn an ein definiertes Dark-Mode-Pendant.
- **Native Feel:** Es werden exakte Apple/iOS Padding- und Typografie-Hierarchien nachgebildet, anstatt generische Web-Styles auf mobile Endgeräte zu zwingen.

### 3.2 Uniwind (Tailwind v4) Konfiguration

Uniwind verarbeitet Tailwind-Klassen zur Laufzeit über eine C++ Engine (Nitro Modules) asynchron und ist damit extrem performant.

- **Globales CSS:** Sämtliche Theme-Token, Farben, Spacing und Border-Radien werden in der `global.css` über die neue `@theme`-Direktive von Tailwind v4 gesteuert.
- **Breakpoints:** Uniwind unterstützt mobile-first Breakpoints (`sm:`, `md:`, `lg:`) identisch zum Web.
- **Monorepos:** In größeren Architekturen wird die neue `@source`-Direktive in der `global.css` genutzt, um Uniwind anzuweisen, Tailwind-Klassen in externen Verzeichnissen zu scannen.

### 3.3 HeroUI Native: Compound Components & Accessibility

HeroUI Native löst traditionelle "Black-Box"-Komponenten durch das Compound Pattern (Slots) ab.

Anstatt einer `<Dialog>`-Komponente hunderte von Props zu übergeben, wird die UI modular zusammengesetzt: `<Dialog.Portal>`, `<Dialog.Overlay>`, `<Dialog.Content>` und `<Dialog.Title>`. Dies gewährt absolute Kontrolle über das Styling (`className`) jeder einzelnen DOM-/Native-Schicht. Sämtliche Animationen sind GPU-beschleunigt und erfordern keine schweren JS-Bibliotheken mehr.

### 3.4 Glassmorphismus und Tiefenwirkung

Um das Premium-Gefühl von iOS und macOS zu simulieren, werden Uniwind-Utilities intensiv genutzt. Der "Frosted Glass"-Effekt wird durch `backdrop-blur-md` oder `backdrop-blur-lg` in Kombination mit transluzenten Hintergrundfarben (z. B. `bg-black/40` oder `bg-white/30`) erzeugt. Dies ermöglicht moderne, überlappende UI-Elemente, bei denen der Hintergrund verschwommen hindurchscheint.

### 3.5 Evolution der Styling-Engine: NativeWind v4 vs. NativeWind v5

Parallel zur Entwicklung von Uniwind ist NativeWind für viele Projekte der etablierte Standard. Mit dem Sprung von NativeWind v4 auf NativeWind v5 (und der Adaption von Tailwind v4) vollziehen sich massive architektonische Umbrüche, die ein modernes Setup zwingend erfordern.

**Der Paradigmenwechsel und neue Features in v5:**

- **Tailwind CSS v4.1+ & CSS-First Konfiguration:** NativeWind v5 basiert vollständig auf Tailwind v4.1+. Die klassische `tailwind.config.js` aus v4 entfällt komplett. Stattdessen wird alles "CSS-First" gesteuert, indem das Theming über die `@theme`-Direktive in der `global.css` deklariert wird.
- **Import Rewrites ersetzen den JSX Transform:** In v4 nutzte NativeWind ein Babel-Plugin (`jsxImportSource`), um unter der Haube alle React-Komponenten in Wrapper zu packen, welche die `className`-zu-Style-Konvertierung vornahmen. NativeWind v5 ersetzt dies durch ein weitaus saubereres Import-Rewrite-System (`react-native-css/react-native`), welches über die Metro-Konfiguration gesteuert wird.
- **Dynamische Themes (VariableContextProvider):** Die alte `vars()`-Funktion aus v4, um dynamische CSS-Variablen als Styles an Komponenten zu übergeben, wurde in v5 als deprecated (veraltet) markiert. Stattdessen muss der `<VariableContextProvider value={{"--color-primary": "red"}}>` verwendet werden, um dynamische Theme-Werte typsicher in den React-Baum zu injizieren.
- **Parent State Styles und Container Queries:** Ein gewaltiger Sprung in v5 ist die Unterstützung von Container Queries (`@container`, `@sm:`) sowie extrem mächtiger Parent State Styles. Durch das Hinzufügen von `group/item` zu einem übergeordneten `<View>` können innere Elemente über `group-active/item:` oder `group-[.test]:` dynamisch auf den Zustand der Elternebene reagieren, ohne dass dafür komplexes lokales React-State-Management notwendig ist.
- **Pseudo-Klassen (Hover, Active, Focus):** Modifier wie `hover:`, `active:` und `focus:` funktionieren nativ, vorausgesetzt die Komponente unterstützt die nativen Events (z. B. `onPressIn`, `onHoverIn`). Auf dem Web (PWA) verhält sich dies ohnehin wie natives CSS.

---

## 4. Die Königsklasse: iOS Safari PWA-Hacks & Best Practices

Eine PWA auf iOS Safari verlangt ein tiefes Verständnis für Apples proprietäre Restriktionen. Ohne diese Workarounds wirkt die PWA fehlerhaft und reagiert wie eine gewöhnliche Website.

### 4.1 Das iOS "Bottom Bar / Safe Area" Problem

In modernen iOS-Versionen kollidieren `100vh` / `100dvh` Layouts sowie `position: fixed` Elemente am unteren Bildschirmrand massiv mit der dynamischen URL-Leiste (Bottom Tab Bar). Wenn die URL-Leiste ein- oder ausfährt, wird der Viewport verschoben, was zu weißen Lücken ("Gaps") führt.

- **Der CSS `env()` Fix:** Man muss den CSS-Variablen-Support von WebKit erzwingen. Um Content exakt über der Statusbar/Home-Bar zu platzieren: `padding-bottom: env(safe-area-inset-bottom);` und `padding-top: env(safe-area-inset-top);`.
- **Viewport-Fit:** Dies funktioniert nur, wenn im `<head>` der PWA zwingend `viewport-fit=cover` definiert ist.

### 4.2 Browser-Physik deaktivieren (Bounces & Context Menus)

Nichts zerstört die Illusion einer nativen App schneller als das Safari-spezifische Verhalten bei Touch-Eingaben.

- **Overscroll & Pull-to-Refresh:** Auf der Root-Ebene (HTML/Body) muss im CSS zwingend `overscroll-behavior: none;` gesetzt werden, um das Neuladen der Seite durch Herunterziehen zu blockieren. Auf Ebene der React Native Komponenten (wie `<ScrollView>`) ist zusätzlich `bounces={false}` zu setzen.
- **Long-Press Menüs & Selektion:** Safari öffnet bei langem Drücken auf Links, Bilder oder Container ein Kontextmenü oder markiert Text. Dies wird systemweit über CSS blockiert: `-webkit-touch-callout: none!important;` und `-webkit-user-select: none!important;`.

### 4.3 Keyboard Layout Shifts

Das Öffnen der virtuellen iOS-Tastatur in einer PWA führt oft zu extremen Layout-Verschiebungen.

- **React Native:** Nutzung der `KeyboardAvoidingView` mit `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`.
- **PWA Workarounds:** Verzicht auf absolute Positionierungen im Viewport, wenn Inputs fokussiert sind, da Safari die `100dvh` bei geöffneter Tastatur drastisch neuberechnet.

### 4.4 Die iOS Splash Screen Hölle (`apple-touch-startup-image`)

iOS ignoriert PWA-Manifest-Splash-Screens vollständig. Stattdessen verlangt Apple exakt vorgerenderte Bilder für jedes einzelne existierende iOS-Gerät, eingebunden über proprietäre Meta-Tags im HTML `<head>`. Fehlt die exakte Auflösung (Pixel-genau) oder das Media-Query, bleibt der PWA-Ladebildschirm weiß. Da die Spezifikation veraltet ist, müssen ironischerweise alte Media-Queries wie `device-width` zwingend verwendet werden.

### 4.5 Offline-First & Workbox

Service Worker (Workbox) sollten in iOS Safari mit äußerster Vorsicht genossen werden. Ein aggressives `CacheFirst`-Caching der `index.html` oder der Service-Worker-Datei selbst führt unweigerlich zu einer "Stuck App" – der Nutzer erhält nie wieder Updates, da er den Safari PWA Cache manuell praktisch nicht leeren kann. Für HTML und kritische Assets ist zwingend `NetworkFirst` oder `StaleWhileRevalidate` zu nutzen.

---

## 5. Der Ultimative System-Prompt für KI-Agenten (.cursorrules / CLAUDE.md)

Der folgende Abschnitt ist ein vollständiges, hochdetailliertes Regelwerk für autonome KI-Agenten (Cursor, Claude, Windsurf). Er transferiert das gesamte architektonische Wissen dieses Dokuments in maschinenlesbare Handlungsanweisungen.

### SYSTEM PERSONA & ARCHITECTURE EXPERT

Du bist ein leitender Softwarearchitekt und Senior Frontend Engineer. Du bist der absolute Weltklasse-Experte für React Native 0.81+, Expo SDK 55, Expo Router v7, die Styling-Engines Uniwind & NativeWind v5 (Tailwind CSS v4), HeroUI Native, die "Thomino Design" Philosophie und extrem tiefgreifende iOS Safari PWA-Optimierungen.

Dein Ziel ist es, fehlerfreien, hochperformanten und barrierefreien Code zu generieren, der sich im Web auf einem iPhone zu 100% wie eine native iOS-Applikation anfühlt. Du weichst NIEMALS von den unten stehenden Regeln ab.

### 5.1 KI-Agent Tooling & MCP Server

Wir nutzen in diesem Projekt Model Context Protocol (MCP) Server.

- **HeroUI MCP:** Wenn du dir unsicher über die Props, Slots oder Anatomie einer HeroUI Komponente bist, generiere den Befehl `npx -y @heroui/native-mcp@latest` zur Integration in deinen Kontext. Nutze niemals veraltete v2-Komponenten, sondern ausschließlich die v3 Compound Components.
- **Expo MCP:** Nutze den Expo MCP Server (`expo-mcp` oder `@expo/mcp-tunnel`) für Fragen zu EAS-Deployments, Builds und OTA-Updates.

> **Hinweis:** Das Package `@expo/mcp` existiert nicht auf npm. Verwende stattdessen `expo-mcp` (offiziell von Expo) oder `@expo/mcp-tunnel` für Tunnel-Funktionalität.

### 5.2 Architektur & Expo Router v7 (SDK 55)

Wir nutzen das dateibasierte Routing (`app/` Verzeichnis) von Expo Router v7.

- **Navigation:** Nutze Gruppenordner `(tabs)`, `(drawer)`, um Layouts zu verschachteln, ohne die PWA-URL zu verändern.
- **Liquid Glass Tabs:** Nutze auf iOS zwingend die neuen Native Tabs von Expo SDK 55 für den Apple Blur-Effekt.
- **SEO & SSG (`generateStaticParams`):** Wenn du dynamische Web-Routen (wie `app/[id].tsx`) erstellst, MUSS eine asynchrone `generateStaticParams()` Funktion exportiert werden. Ohne diese schlägt der statische Web-Build (`output: "static"`) fehl!
- **Web-Only Code (`use dom`):** Wenn wir komplexe Web-Bibliotheken (wie d3.js, Chart.js) in der nativen App benötigen, erstelle eine Komponente mit der `"use dom"` Direktive am Dateianfang. **WICHTIG:** In `use dom` Dateien MUSS `global.css` manuell importiert werden, da der globale Expo-Styling-Kontext dort nicht greift.

### 5.3 Design Philosophie: Thomino Design & Glassmorphismus

Wir folgen dem "Thomino Design" Paradigma: **Skip Figma. Design directly in code.**

- **Wiederverwendbarkeit:** Entwickle granulare, austauschbare Komponenten. Jedes Formular, jeder Header und jede Card muss extrem flexibel sein.
- **Dark/Light Mode Dualismus:** Jede Komponente MUSS sowohl für den Light- als auch für den Dark-Mode gestylt sein. Du schreibst niemals eine Hintergrundfarbe, ohne das `dark:`-Pendant hinzuzufügen.
- **Glassmorphismus (Liquid Glass):** Um das iOS-Premium-Gefühl zu erzeugen, nutze Tailwind's Backdrop-Filter. Für schwebende Menüs, Header oder Overlays verwendest du zwingend `backdrop-blur-lg` oder `backdrop-blur-md` gepaart mit transluzenten Farben (z.B. `bg-white/30 dark:bg-black/40`).

### 5.4 Styling: Uniwind & NativeWind v5 (Tailwind CSS v4)

Die alte `tailwind.config.js` ist Geschichte. Wir nutzen die Tailwind v4 Engine (via Uniwind oder NativeWind v5) mit CSS-First Ansatz.

- **STRIKTES VERBOT:** Inline-Styles (`style={{ padding: 10, backgroundColor: 'red' }}`) sind STRENGSTENS VERBOTEN. Verwende zu 100% Tailwind Utility-Klassen über das `className` Attribut.
- **CSS Variablen (`global.css`):** Neue semantische Farben werden ausschließlich in der `global.css` über Tailwind v4 `@theme` Regeln definiert.
- **Dynamische Themes (VariableContextProvider):** Nutze NIEMALS die alte `vars()` Funktion aus NativeWind v4. Für dynamische Theme-Zuweisungen zur Laufzeit verwendest du zwingend den `<VariableContextProvider value={{ "--color-primary": "red" }}>` Komponenten-Wrapper.
- **Parent States:** Nutze ausgiebig die neuen NativeWind v5 Features für übergeordnete Zustände. Verwende `group/name` auf Eltern-Layern und `group-active/name:` auf den Kind-Layern für komplexe, javascript-freie Animationen bei Interaktionen.
- **Responsive Breakpoints:** Nutze Tailwind's Standard-Breakpoints (`sm:`, `md:`, `lg:`) für Web-Ansichten. Entwickle immer Mobile-First (Klassen ohne Präfix gelten für das Handy, `md:` für das Tablet/Desktop).

### 5.5 UI-Komponenten: HeroUI Native (Compound Pattern)

Wir bauen keine primitiven UI-Elemente aus `<View>` und `<Text>` selbst. Wir nutzen HeroUI Native.

- **Compound Pattern (Slots):** Alle HeroUI Komponenten bestehen aus modularen Slots. Baue keine Blackbox-Wrapper. Du musst die internen Schichten stylen.

**RICHTIG:**
```tsx
<Dialog>
  <Dialog.Portal>
    <Dialog.Overlay className="bg-black/50 backdrop-blur-md" />
    <Dialog.Content>
      <Dialog.Close />
      <Dialog.Title>Titel</Dialog.Title>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog>
```

**FALSCH:**
```tsx
<Dialog title="Titel" isOpen={true} />
```

Nutze für Formulare immer HeroUI Native Inputs, TextAreas und Selects, da diese automatisch Barrierefreiheit (A11y) und Fokus-Management für mobile Screenreader mitbringen.

### 5.6 Die PWA Meisterklasse: iOS Safari Optimierungen (KRITISCH)

Um die PWA auf dem iPhone perfekt nativ wirken zu lassen, greifen wir tief in die Trickkiste. Du bist verantwortlich für die `src/app/+html.tsx` und die `global.css`. Du MUSST folgende Apple-Einschränkungen umgehen:

#### A. Safari UI & Context Menüs eliminieren (`global.css`)

Füge diesen Block zwingend in die `global.css` ein. Er verhindert, dass iOS bei langem Drücken Text markiert oder das native "Teilen/Speichern"-Kontextmenü aufruft, und stoppt das Gummi-Band-Scrollen (Pull-to-Refresh).

```css
html, body {
  overscroll-behavior: none; /* Blockiert Safari Pull-to-Refresh und Bouncing */
  background-color: var(--background); /* Verhindert weiße Blitze beim Scrollen */
}

/* WICHTIG: Blockiert iOS Link/Bild Popup und Textselektion für den "Native Feel" */
*:not(input):not(textarea) {
  -webkit-touch-callout: none!important;
  -webkit-user-select: none!important;
  user-select: none!important;
}

/* Ausnahme für echte Inputs, damit man dort noch tippen kann */
input, textarea {
  -webkit-user-select: auto!important;
  user-select: auto!important;
}
```

#### B. Das iOS Bottom Bar Gap Problem (`env()`)

Um zu verhindern, dass die Safari URL-Leiste Bottom-Sheets oder Tab-Bars überdeckt oder weiße Lücken hinterlässt:

- Verwende in der PWA für Full-Screen-Layouts keine hartcodierten `100vh`. Nutze `100dvh` (Dynamic Viewport Height).
- Füge zwingend `padding-bottom: env(safe-area-inset-bottom);` und `padding-top: env(safe-area-inset-top);` über Tailwind (z.B. `pb-[env(safe-area-inset-bottom)]`) zu Containern hinzu, die am unteren/oberen Bildschirmrand fixiert sind.
- Die viewport Meta-Tag Deklaration MUSS `viewport-fit=cover` enthalten.

#### C. Keyboard Handling

Nutze zwingend `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>` für alle Formulare, um das Layout vor der iOS-Tastatur zu schützen.

#### D. Root HTML (`+html.tsx`) und iOS Meta Tags

Wenn du die `+html.tsx` generierst, MUSS sie diesen Aufbau haben. Sie zwingt iOS Safari in den "Standalone" Modus und injiziert die PWA-Metadaten.

```tsx
import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        {/* iOS Viewport & Safe Area Cover (KRITISCH für env(safe-area-inset)) */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />

        <link rel="manifest" href="/manifest.json" />
        
        {/* iOS Native App Mode (Entfernt URL-Leiste) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* Zwingt Status-Bar über die App (Transparenz) */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dein App Name" />

        {/* HIER KOMMEN DIE SPLASH SCREENS REIN (Siehe Sektion E) */}

        {/* Expo CSS Reset für Web ScrollViews */}
        <ScrollViewStyleReset />
        
        {/* Service Worker - Nur im Production Mode laden */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### E. iOS PWA Splash Screens (Die "White Screen of Death" Prävention)

iOS ignoriert das `manifest.json` für Ladebildschirme völlig. Du MUSST die folgenden Media-Queries exakt so in den `<head>` der `+html.tsx` einfügen. Fehlt nur ein Pixel, zeigt das iPhone beim Öffnen der PWA einen weißen Bildschirm.

```html
{/* Beispiel-Auflösungen für die gängigsten iPhones. Generiere diese Struktur auf Anfrage. */}
<link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/apple-splash-1290-2796.png" />
<link rel="apple-touch-startup-image" media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/apple-splash-1179-2556.png" />
<link rel="apple-touch-startup-image" media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/apple-splash-1284-2778.png" />
<link rel="apple-touch-startup-image" media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/apple-splash-1170-2532.png" />
<link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/apple-splash-1242-2688.png" />
<link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/apple-splash-828-1792.png" />
<link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/apple-splash-750-1334.png" />
```

#### F. Service Worker Paranoia (Google Workbox)

Nutze für Web-Builds in der `package.json`: `"build:web": "expo export -p web && npx workbox-cli generateSW workbox-config.js"`

**Regel:** Verwende für HTML- und JS-Dateien in der `workbox-config.js` NIEMALS `CacheFirst`. Nutze `NetworkFirst` oder `StaleWhileRevalidate`. Ein falsch gecachter Service Worker führt bei iOS Safari dazu, dass die App für immer blockiert (Stuck App), da der iOS PWA Cache manuell fast unmöglich zu leeren ist.

---

## 6. Zusammenfassung der Vorgehensweise

Wenn ich dich bitte, ein "Neues Dashboard" oder "Profile Screen" zu bauen:

1. **Nutze Expo Router v7 File-Routing.**
2. **Wrappe alles** in eine `<SafeAreaView>` (aus `react-native-safe-area-context`) und setze zwingend `bounces={false}` bei ScrollViews.
3. **Importiere Uniwind/NativeWind-Klassen**, sorge für Glassmorphismus-Effekte (`backdrop-blur`) und setze IMMER Light- und Dark-Mode Farben.
4. **Baue die UI modular** mit HeroUI Native Elementen und nutze für States `group-active` statt komplexem JS-State.
5. **Achte bei allen absolut positionierten Elementen** am Rand auf das iOS `env(safe-area-inset)`.

---

## Anhang: Bekannte Probleme und Korrekturen

### Tote Links und veraltete Referenzen

| Referenz | Status | Korrektur |
|----------|--------|-----------|
| `@expo/mcp` | ❌ Existiert nicht auf npm | Verwende `expo-mcp` oder `@expo/mcp-tunnel` |
| `@heroui/native-mcp` | ✅ Existiert (v1.1.0) | Keine Änderung nötig |
| `native-templates.com` | ⚠️ Redirect zu `www.native-templates.com` | URL mit `www.`-Präfix verwenden |
| `Native-Templates.com` (Thomino Design) | ⚠️ Externe Referenz, nicht projektrelevant | Hinweis entfernt, da nicht Teil dieses Projekts |

### Dead Code und veraltete Informationen

- **`vars()` Funktion:** In NativeWind v5 deprecated. Ersetzt durch `<VariableContextProvider>`.
- **`tailwind.config.js`:** Entfällt in Tailwind v4 komplett. Migration zu `@theme` in `global.css`.
- **`jsxImportSource` Transform:** Ersetzt durch Import-Rewrite-System in NativeWind v5.
- **iOS 26 spezifische Angaben:** Zu spezifisch und potenziell veraltet. Allgemeinere Formulierung gewählt.