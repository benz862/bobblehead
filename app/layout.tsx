import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BobbleMe! — Custom AI Bobblehead Creator",
  description: "Turn yourself into an awesome custom bobblehead! Pick your team, outfit, or go wild with a custom character. AI-powered, 150+ real teams, instant HD download.",
  keywords: ["bobblehead", "AI", "custom", "sports", "gift", "personalized"],
  openGraph: {
    title: "BobbleMe! — Custom AI Bobblehead Creator",
    description: "Upload your photo, pick your sport or dream job, and get a one-of-a-kind AI bobblehead. Starting at $7.99!",
    type: "website",
    siteName: "BobbleMe!",
  },
  twitter: {
    card: "summary_large_image",
    title: "BobbleMe! — Custom AI Bobblehead Creator",
    description: "Turn yourself into an awesome custom bobblehead! AI-powered, 150+ real teams.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
