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
          <a
            href="https://thepolygon.ca/about/"
            target="_blank"
            rel="noopener noreferrer"
          >
            About
          </a>
          <a
            href="https://thepolygon.ca/contact-us/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact
          </a>
          <a
            href="https://thepolygon.ca/support/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Support
          </a>
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
