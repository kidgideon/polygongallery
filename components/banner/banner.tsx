"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./banner.module.css";
import imageOne from "../../images/bannerImageOne.jpg";

const phrases = [
  "Official Artwork Certification",
  "Official Artwork Certification Service",
  "Recognized Internationally",
];

const Banner = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 6000); // ⏱ text changes every 6s
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={styles.bannerInterface}
      style={{ backgroundImage: `url(${imageOne.src})` }}
    >
      {/* Overlay */}
      <div className={styles.bannerOverlay}>
        {/* Logo top left */}
        <motion.h1
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className={styles.bannerLogo}
        >
          PolygonGallery
        </motion.h1>

        {/* Center text */}
        <div className={styles.bannerTextArea}>
          <AnimatePresence mode="wait">
            <motion.h2
              key={phrases[index]}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 1 }}
              className={styles.bannerHeading}
            >
              {phrases[index]}
            </motion.h2>
          </AnimatePresence>

          <motion.p
            key={`sub-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className={styles.bannerSubText}
          >
            Certify your artworks with trust & recognition worldwide
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default Banner;
