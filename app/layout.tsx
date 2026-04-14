import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Friday — CrownRing Jewelry Assistant",
  description:
    "Ask Friday anything about CrownRing's collections, materials, sizing, or care guides.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-navy font-sans antialiased">{children}</body>
    </html>
  );
}
