// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SocketProvider } from "@/components/providers/SocketProvider";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mr. Worldwide — Global Monopoly",
  description: "Multiplayer global Monopoly with real-world cities",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌍</text></svg>" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
