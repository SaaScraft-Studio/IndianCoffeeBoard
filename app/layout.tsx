import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "National Coffee Championships 2025 - India Coffee Board Registration",
  description:
    "Register for India's premier coffee competition. Showcase your skills and compete with the best coffee professionals across Mumbai, Delhi, and Bengaluru.",
  keywords:
    "coffee, championship, india, registration, competition, barista, specialty coffee, SCAI",
  authors: [{ name: "India Coffee Board" }],
  openGraph: {
    title: "National Coffee Championships 2025",
    description: "Register for India's premier coffee competition",
    type: "website",
    locale: "en_IN",
  },
  icons: {
    icon: "/coffee-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "Inter, sans-serif" }}>{children}</body>
    </html>
  );
}
