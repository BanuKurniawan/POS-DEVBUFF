import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KasirKITA - Kasir & Manajemen Stok Sembako",
  description: "Aplikasi POS kasir dan manajemen stok cepat, responsif, dan mudah digunakan untuk toko sembako.",
  icons: {
    icon: [
      { url: "/KasirKITA.png" },
      { url: "/kaskita.png" },
    ],
    shortcut: "/KasirKITA.png",
    apple: "/KasirKITA.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${lato.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ground text-text font-sans selection:bg-accent-light selection:text-accent">
        {children}
      </body>
    </html>
  );
}
