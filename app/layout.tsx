import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import { ColorThemeProvider } from "@/src/contexts/color-theme-context";
import { ModulesProvider } from "@/src/contexts/modules-context";
import { QueryProviderWrapper } from "@/src/contexts/trpc-query-provider-wrapper";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AdaTools - Developer Tools",
  description: "A collection of practical tools for developers",
  openGraph: {
    title: "AdaTools",
    description: "A collection of practical tools for developers",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "AdaTools",
      },
    ],
    locale: "en_EN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AdaTools",
    description: "A collection of practical tools for developers",
    images: ["/og-image.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-color-theme="cyan"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body
        className={` ${jetbrainsMono.variable}  ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ColorThemeProvider>
          <QueryProviderWrapper>
            <ModulesProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <Header />
                <main className="flex-1">{children}</main>
                <Toaster />
                <Footer />
              </ThemeProvider>
            </ModulesProvider>
          </QueryProviderWrapper>
        </ColorThemeProvider>
      </body>
    </html>
  );
}
