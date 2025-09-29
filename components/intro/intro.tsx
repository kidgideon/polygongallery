"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./intro.module.css";
import teal from "../../images/teal.jpg"

const Intro = () => {
  return (
    <section className={styles.IntroInterface}>
      <div className={styles.contentWrapper}>
        {/* Text */}
        <motion.div
          className={styles.textBlock}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2>Authenticity in Art</h2>
          <p>
            Every masterpiece deserves recognition. PolygonGallery provides
            independent art certification, ensuring authenticity and credibility
            for artists and collectors worldwide.
          </p>
        </motion.div>

        {/* Single Image */}
        <motion.div
          className={styles.imageWrapper}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Image
            src={teal}
            alt="Artwork being certified"
            className={styles.image}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Intro;
