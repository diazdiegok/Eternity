import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { SITE, getBaseUrl } from "@/lib/config";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: `${SITE.brandFull} | Joyas de leche materna`,
  description: `${SITE.tagline}. ${SITE.subtitle}`,
  openGraph: {
    title: SITE.brandFull,
    description: SITE.tagline,
    images: ["/logo.webp"],
  },
};

export const viewport = {
  themeColor: "#f7f1ea",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable} h-full`} style={{ colorScheme: "light" }}>
      <body className="flex min-h-full flex-col bg-[#f7f1ea] font-sans text-[#4a3b30] antialiased">
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
