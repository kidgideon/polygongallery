"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./banner.module.css";
import imageOne from "../../images/bannerImageOne.jpg";
import imageTwo from "../../images/bannerImageTwo.jpg";
import imageThree from "../../images/bannerImageThree.jpg";

const backgroundImages = [imageOne, imageTwo, imageThree];
const phrases = [
  "Official Artwork Certification",
  "Official Artwork Certification Service",
  "Recognized Internationally",
];

const Banner = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000); // ⏱ 6s per slide
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.bannerInterface}>
      {/* Carousel Track */}
      <div className={styles.bannerSlider}>
        <motion.div
          className={styles.bannerTrack}
          animate={{ x: `-${index * 100}%` }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          {backgroundImages.map((img, i) => (
            <div
              key={i}
              className={styles.bannerBackground}
              style={{ backgroundImage: `url(${img.src})` }}
            />
          ))}
        </motion.div>
      </div>

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

          <AnimatePresence mode="wait">
            <motion.p
              key={`sub-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4, duration: 1 }}
              className={styles.bannerSubText}
            >
              Certify your artworks with trust & recognition worldwide
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Banner;
