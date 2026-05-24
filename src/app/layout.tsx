import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatBubble from "@/components/ChatBubble";
import { CartProvider } from "@/components/CartProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sf",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Dave's Mobile Shop — Phone Repair & Refurbished Phones",
  description:
    "Fast, honest mobile phone repair, quality refurbished phones and parts shipped Canada-wide. Serving the GTA, Montréal, Ottawa, Québec, Moncton and Halifax.",
  keywords: ["phone repair", "iPhone repair", "Samsung repair", "refurbished phones", "phone parts Canada", "Toronto", "Montreal", "Ottawa", "Halifax", "Moncton", "Quebec"]
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
