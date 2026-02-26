import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { ChartProvider } from "./contexts/ChartContext";
import AccessibilityButton from "./components/AccessibilityButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard Saber 11",
  description: "Dashboard interactivo para el análisis de resultados Saber 11",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AccessibilityProvider>
          <ChartProvider>
            <div style={{ fontSize: 'var(--font-size, 1rem)' }}>
              {children}
            </div>
            <AccessibilityButton />
          </ChartProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
