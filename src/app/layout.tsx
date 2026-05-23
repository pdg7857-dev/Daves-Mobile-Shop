import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";

export const metadata: Metadata = {
  title: "Dave's Mobile Shop — Phone Repair & Refurbished Phones",
  description:
    "Fast, honest mobile phone repair, quality refurbished phones and parts shipped Canada-wide. Serving the GTA, Montréal, Ottawa, Québec, Moncton and Halifax.",
  keywords: ["phone repair", "iPhone repair", "Samsung repair", "refurbished phones", "phone parts Canada", "Toronto", "Montreal", "Ottawa", "Halifax", "Moncton", "Quebec"]
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-950 text-gray-100 antialiased">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
