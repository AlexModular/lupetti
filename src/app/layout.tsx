import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "I Lupetti • Giocattoleria ★ Ludoteca | Feste, Laboratori & Giochi",
  description:
    "Benvenuti da I Lupetti: Giocattoleria educativa e Ludoteca per bambini. Feste di compleanno in esclusiva, laboratori creativi, gioco assistito e idee regalo in legno.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
