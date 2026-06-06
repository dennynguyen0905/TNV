import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LangPath — Language Learning",
    template: "%s | LangPath",
  },
  description: "Learn languages with reading, listening, dictation, grammar, and vocabulary lessons.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
