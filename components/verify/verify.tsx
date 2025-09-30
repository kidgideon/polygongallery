"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./verify.module.css";

interface PaymentMethod {
  address: string;
  id: string;
  logo?: string;
  name: string;
}

interface Payment {
  amount: number;
  method: PaymentMethod;
  proofUrl?: string;
}

interface ArtworkItem {
  id: string;
  dimensions: string;
  imageUrl: string;
  medium: string;
  title: string;
  year: string;
  createdAt: { seconds: number };
  status?: "pending" | "certified" | "disapproved";
  payment?: Payment;
  artist: {
    fullName: string;
    email: string;
    country: string;
  };
}

const Verify = () => {
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomedArtwork, setZoomedArtwork] = useState<ArtworkItem | null>(null);
  const [detailsArtwork, setDetailsArtwork] = useState<ArtworkItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchArtworks = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "artworks"));
    const allArtworks: ArtworkItem[] = [];

    snap.docs.forEach((docSnap) => {
      const data = docSnap.data();
      if (Array.isArray(data.artworks)) {
        data.artworks.forEach((a: any, index: number) => {
          allArtworks.push({
            ...a,
            id: a.id || `${docSnap.id}-${index}`, // ensure unique ID
            artist: data.artist,
            payment: data.payment,
          });
        });
      }
    });

    allArtworks.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setArtworks(allArtworks);
    setLoading(false);
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  const updateStatus = async (artwork: ArtworkItem, status: "certified" | "disapproved") => {
    setUpdatingId(artwork.id);
    const artistDocs = await getDocs(collection(db, "artworks"));
    for (const docSnap of artistDocs.docs) {
      const data = docSnap.data();
      const updatedArtworks = (data.artworks || []).map((a: any) =>
        a.id === artwork.id ? { ...a, status } : a
      );
      await updateDoc(doc(db, "artworks", docSnap.id), { artworks: updatedArtworks });
    }
    await fetchArtworks();
    setUpdatingId(null);
  };

  return (
    <div className={styles.verifyInterface}>
      <h2>Artwork Verification</h2>

      {loading ? (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Loading artworks...
        </motion.p>
      ) : artworks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No artworks pending verification.</p>
        </div>
      ) : (
        <div className={styles.cards}>
          <AnimatePresence>
            {artworks.map((art, index) => (
              <motion.div
                key={art.id || index} // fallback in case id is missing
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.imageArea}>
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    className={styles.artImg}
                    onClick={() => setZoomedArtwork(art)}
                  />
                </div>

                <div className={styles.info}>
                  <p><strong>{art.title}</strong> ({art.year})</p>
                  <p>{art.medium}</p>
                  <p>Status: <span className={styles.status}>{art.status || "pending"}</span></p>
                  <button
                    className={styles.viewDetailsBtn}
                    onClick={() => setDetailsArtwork(art)}
                  >
                    View Details
                  </button>
                </div>

                <div className={styles.actions}>
                  {art.status !== "certified" && (
                    <button
                      onClick={() => updateStatus(art, "certified")}
                      className={styles.certifyBtn}
                      disabled={updatingId === art.id}
                    >
                      {updatingId === art.id ? "Loading..." : "Certify"}
                    </button>
                  )}
                  {art.status !== "disapproved" && (
                    <button
                      onClick={() => updateStatus(art, "disapproved")}
                      className={styles.rejectBtn}
                      disabled={updatingId === art.id}
                    >
                      {updatingId === art.id ? "Loading..." : "Reject"}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Zoomed Artwork Image */}
      <AnimatePresence>
        {zoomedArtwork && (
          <motion.div
            className={styles.popupOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedArtwork(null)}
          >
            <motion.img
              src={zoomedArtwork.imageUrl}
              alt={zoomedArtwork.title}
              className={styles.zoomedImage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Artwork Details Popup */}
      <AnimatePresence>
        {detailsArtwork && (
          <motion.div
            className={styles.popupOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailsArtwork(null)}
          >
            <motion.div
              className={styles.detailsPopup}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{detailsArtwork.title} ({detailsArtwork.year})</h3>
              <p><strong>Artist:</strong> {detailsArtwork.artist.fullName}</p>
              <p><strong>Email:</strong> {detailsArtwork.artist.email}</p>
              <p><strong>Country:</strong> {detailsArtwork.artist.country}</p>
              <p><strong>Medium:</strong> {detailsArtwork.medium}</p>
              <p><strong>Dimensions:</strong> {detailsArtwork.dimensions}</p>

              {detailsArtwork.payment?.proofUrl && (
                <div className={styles.paymentProof}>
                  <p><strong>Paid Amount:</strong> ${detailsArtwork.payment.amount}</p>
                  <p><strong>Payment Method:</strong> {detailsArtwork.payment.method.name}</p>

                  {/* Open proof in new tab */}
                  <a
                    href={detailsArtwork.payment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewProofBtn}
                  >
                    View Payment Proof
                  </a>
                </div>
              )}

              <button
                className={styles.closeBtn}
                onClick={() => setDetailsArtwork(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Verify;
