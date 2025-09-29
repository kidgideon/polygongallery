import Head from "next/head";
import Navbar from "../components/navbar/navbar";
import Banner from "../components/banner/banner";
import Footer from "../components/footer/footer";
import Intro from "../components/intro/intro";
import Verification from "../components/verification/verification";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>PolygonGallery – Art Certification & Gallery</title>
        <meta
          name="description"
          content="PolygonGallery offers internationally recognized certificates of authenticity for your artworks. Certify your art and display with confidence."
        />

        {/* Open Graph / Facebook */}
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

        {/* Favicon */}
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
      </Head>

      <div className={styles.homeInterface}>
        <Navbar />
        <Banner />
        <Intro />
        <Verification />
        <Footer />
      </div>
    </>
  );
}
