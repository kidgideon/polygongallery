import "./global.css";
import { ReactNode } from "react";

export const metadata = {
  title: "PolygonGallery – Art Certification & Gallery",
  description:
    "PolygonGallery offers internationally recognized certificates of authenticity for your artworks. Certify your art and display with confidence.",
  openGraph: {
    title: "PolygonGallery – Art Certification & Gallery",
    description:
      "PolygonGallery offers internationally recognized certificates of authenticity for your artworks. Certify your art and display with confidence.",
    url: "https://thepolygon.ca",
    siteName: "PolygonGallery",
    images: [
      {
        url: "/logo.jpg", // must be in public/
        width: 800,
        height: 600,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PolygonGallery – Art Certification & Gallery",
    description:
      "PolygonGallery offers internationally recognized certificates of authenticity for your artworks. Certify your art and display with confidence.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
