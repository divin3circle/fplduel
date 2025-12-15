import type { Metadata } from "next";
import { Dosis } from "next/font/google";
import "./globals.css";
import QueryProvider from "./QueryProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import { ThirdwebProvider } from "thirdweb/react";

const geistSans = Dosis({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FPL Duel",
  description: "Bet with crypto on your favorite EPL Fantasy League teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <ThirdwebProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>{children}</QueryProvider>
            <ThemeToggle />
          </ThemeProvider>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
