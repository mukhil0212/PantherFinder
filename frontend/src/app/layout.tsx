import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MagnifyTransitionProvider } from "@/components/MagnifyTransitionContext";
import { AuthProvider } from "../context/AuthContext";
import NavbarDemo from "@/components/navbar-menu-demo";
import ThemeScript from "./theme-script";
import { ThemeInitScript } from "./theme-init-script";
import ClientZoomWrapper from '@/components/ClientZoomWrapper';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PantherFinder - Lost and Found",
  description: "A modern platform to connect lost items with their owners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <ThemeInitScript />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <MagnifyTransitionProvider>
              <div className="min-h-screen flex flex-col">
                <ThemeScript />
                <NavbarDemo />
                <main className="flex-grow pt-20 bg-[var(--background)] text-[var(--foreground)]">
                  <ClientZoomWrapper>
                    {children}
                  </ClientZoomWrapper>
                </main>
              </div>
            </MagnifyTransitionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
