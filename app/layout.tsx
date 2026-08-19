import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenGap",
  description:
    "Find what's missing in research. Inspect whether a research idea shows a potential evidence-backed gap using OpenAIRE records.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
