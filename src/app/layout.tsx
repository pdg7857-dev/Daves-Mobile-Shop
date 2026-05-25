import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatBubble from "@/components/ChatBubble";
import { CartProvider } from "@/components/CartProvider";
import { getSiteUrlObject } from "@/lib/site-url";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sf",
  weight: ["400", "500", "600", "700"]
});

const SITE_URL = getSiteUrlObject();

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: "Phone Repair Canada — Mail-in iPhone, Samsung & Pixel Fix | Dave's Mobile Shop",
    template: "%s | Dave's Mobile Shop"
  },
  description:
    "Fast, honest mail-in phone repair across Canada. Refurbished iPhones, Samsungs and Pixels with a 180-day warranty. Open 7 days a week, 8 AM – 9 PM ET. Emergency repairs available.",
  keywords: [
    // Top-level
    "phone repair Canada", "iPhone repair Canada", "Samsung repair Canada", "Pixel repair Canada",
    "mail-in phone repair", "ship phone for repair", "phone repair near me",
    // Service-level
    "screen replacement", "battery replacement", "back glass replacement",
    "charging port repair", "camera repair", "water damage repair",
    // Refurb
    "refurbished iPhone Canada", "used iPhone Canada", "certified refurbished phones",
    "buy used phone Canada",
    // City-level (top markets)
    "phone repair Toronto", "phone repair Vancouver", "phone repair Montréal",
    "phone repair Calgary", "phone repair Ottawa", "phone repair Edmonton",
    "phone repair Halifax", "phone repair Winnipeg", "phone repair Quebec City"
  ],
  openGraph: {
    type: "website",
    siteName: "Dave's Mobile Shop",
    locale: "en_CA",
    title: "Phone Repair Canada — Mail-in iPhone & Samsung Fix",
    description: "180-day warranty on refurbished phones. 90-day on every repair. Open 7 days a week."
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL?.toString() || "/" }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Chat targets read from env so deploy can change them without a rebuild.
  // Falls back to the regular business phone for WhatsApp when no dedicated
  // number is set.
  const whatsappPhone =
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE || process.env.NEXT_PUBLIC_BUSINESS_PHONE || "";
  const messengerUsername = process.env.NEXT_PUBLIC_MESSENGER_USERNAME || "";

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-black text-white antialiased">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatBubble whatsappPhone={whatsappPhone} messengerUsername={messengerUsername} />
        </CartProvider>
      </body>
    </html>
  );
}
