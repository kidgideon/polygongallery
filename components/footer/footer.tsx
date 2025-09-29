"use client";
import styles from "./footer.module.css";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand / Logo */}
        <div className={styles.brand}>
          <p>© {new Date().getFullYear()} PolygonGallery</p>
        </div>

        {/* Links */}
        <div className={styles.links}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/support">Support</Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <p>
          Disclaimer: PolygonGallery provides certification services for artworks,
          but does not represent international governing authorities. Authenticity
          recognition is subject to international variations and independent
          evaluation.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
