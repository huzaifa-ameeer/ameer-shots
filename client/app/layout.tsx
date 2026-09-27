import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Navbar from "./components/Navbar";
import "./globals.css";

// Space Grotesk ships as a variable font, so the whole weight range is
// available without listing them individually.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AmeerShots",
  description: "A gallery of photographs by Ameer",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
