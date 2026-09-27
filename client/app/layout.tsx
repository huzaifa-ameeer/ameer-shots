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

/**
 * Applies the stored theme (or the system preference on a first visit) before
 * the browser paints, so the page never flashes the wrong one.
 */
const themeScript = `(function(){try{var s=localStorage.getItem("theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The script below edits the class on <html>, hence the suppression.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
