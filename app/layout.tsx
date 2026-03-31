import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Equipulse",
  description: "Equipulse is a platform for creating and managing your own stock market portfolio. It is a real-time stock market portfolio tracker that allows you to track your portfolio and make trades in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
