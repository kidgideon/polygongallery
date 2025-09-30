import "./global.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        {/* SEO Meta Tags */}
        <title>PolygonGallery – Art Certification & Gallery</title>
        <meta
          name="description"
          content="PolygonGallery offers internationally recognized certificates of authenticity for your artworks. Certify your art and display with confidence."
        />

        {/* Favicon */}
        <link rel="icon" href="/logo.jpg" />

        {/* Open Graph */}
        <meta property="og:title" content="PolygonGallery – Art Certification & Gallery" />
        <meta
          property="og:description"
          content="PolygonGallery offers internationally recognized certificates of authenticity for your artworks. Certify your art and display with confidence."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thepolygon.ca" />
        <meta property="og:image" content="/logo.jpg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PolygonGallery – Art Certification & Gallery" />
        <meta
          name="twitter:description"
          content="PolygonGallery offers internationally recognized certificates of authenticity for your artworks. Certify your art and display with confidence."
        />
        <meta name="twitter:image" content="/logo.jpg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
