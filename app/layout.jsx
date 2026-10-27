import "./globals.css";

export const metadata = {
  title: "ASCII to image",
  description: "Turn ASCII art into a square 4096 × 4096 PNG, JPEG, or WebP. Choose a font, paste your characters, and download. Everything stays in your browser.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><noscript><p className="noscript-note">Enable JavaScript to preview and download your ASCII art.</p></noscript>{children}</body></html>;
}
