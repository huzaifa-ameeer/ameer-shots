import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Toaster } from "react-hot-toast";
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

        {/* Mounted once here so any client component can raise a toast. */}
        <Toaster
          position="top-center"
          gutter={12}
          toastOptions={{
            duration: 4000,
            className:
              "!rounded-xl !border !border-neutral-200 !bg-white !text-neutral-900 !shadow-lg dark:!border-neutral-800 dark:!bg-neutral-900 dark:!text-neutral-100",
          }}
        />
      </body>
    </html>
  );
}
