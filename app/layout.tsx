import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Bobblehead Generator",
  description: "Create your custom AI bobblehead with sports and occupation themes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
