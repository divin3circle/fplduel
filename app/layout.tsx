import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "./globals.css";
import QueryProvider from "./QueryProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import { ThirdwebProvider } from "thirdweb/react";

const karlaSans = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FPL Duel",
  description:
    "Turn FPL Passion into Crypto Wins: Peer-to-Peer, Parimutuel Pools on Hedera.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${karlaSans.variable} antialiased`}>
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
