import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Dave's Mobile Shop — Phone Repair & Refurbished Phones",
  description:
    "Fast, honest mobile phone repair and quality refurbished phones across the GTA, Montréal, Ottawa, Québec, Moncton and Halifax. Screen, battery, camera, housing and parts.",
  keywords: ["phone repair", "iPhone repair", "Samsung repair", "refurbished phones", "Toronto", "Montreal", "Ottawa", "Halifax", "Moncton", "Quebec"]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
