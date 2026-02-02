import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swastika '26 Admin",
  description: "Admin Dashboard for Swastika 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
