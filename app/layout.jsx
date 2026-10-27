import "./globals.css";

export const metadata = {
  title: "ASCII to image",
  description: "Turn ASCII art into PNG, JPEG, or WebP images and banners. Choose a canvas, font, and resolution, then download. Everything stays in your browser.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><noscript><p className="noscript-note">Enable JavaScript to preview and download your ASCII art.</p></noscript>{children}</body></html>;
}
