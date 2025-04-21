import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "../context/AuthContext";
import NavbarDemo from "@/components/navbar-menu-demo";
import ThemeScript from "./theme-script";
import { ThemeInitScript } from "./theme-init-script";

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
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <ThemeScript />
              <NavbarDemo />
              <main className="flex-grow pt-20">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
