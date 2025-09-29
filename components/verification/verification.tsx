"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./verification.module.css";
import art from "../../images/nakedArt.jpg"; // left-side art image (desktop)
import { db, storage } from "../../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

/* ---------- Types ---------- */
interface Artist {
  fullName: string;
  email: string;
  country: string;
}

interface ArtworkEntry {
  id: number;
  title: string;
  medium: string;
  dimensions: string;
  year: string;
  file: File | null;
  preview: string | null;
  uploadProgress: number;
  uploadedUrl: string | null;
}

interface PaymentMethod {
  id: string;
  name: string;
  logo?: string;
  address: string;
}

interface ProgressBarProps {
  value: number;
}

/* ---------- Helper small components ---------- */
const Spinner = () => (
  <div className={styles.spinner}>
    <div className={styles.doubleBounce1}></div>
    <div className={styles.doubleBounce2}></div>
  </div>
);

const ProgressBar = ({ value }: ProgressBarProps) => (
  <div className={styles.progressWrap}>
    <div className={styles.progressBar} style={{ width: `${value}%` }} />
    <span className={styles.progressText}>{Math.round(value)}%</span>
  </div>
);

/* ---------- Main Component ---------- */
const Verification = () => {
  // Artist details
  const [artist, setArtist] = useState<Artist>({
    fullName: "",
    email: "",
    country: "",
  });

  // Artwork entries
  const [artworks, setArtworks] = useState<ArtworkEntry[]>([
    {
      id: Date.now(),
      title: "",
      medium: "",
      dimensions: "",
      year: "",
      file: null,
      preview: null,
      uploadProgress: 0,
      uploadedUrl: null,
    },
  ]);

  // Payment methods fetched from Firestore payments collection
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // UI states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null
  );
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track upload progress
  const progressRef = useRef<Record<number, number>>({});

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoadingPayments(true);
        const col = collection(db, "payments");
        const snapshot = await getDocs(col);
        const rebuilt: PaymentMethod[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as Omit<PaymentMethod, "id">;
          rebuilt.push({ id: d.id, ...data });
        });
        setPaymentMethods(rebuilt);
      } catch (err) {
        console.error("fetchPayments", err);
        setError("Could not load payment methods.");
      } finally {
        setLoadingPayments(false);
      }
    };
    fetchPayments();
  }, []);

  /* ---------- Form handlers ---------- */
  const updateArtist = (key: keyof Artist, val: string) =>
    setArtist((s) => ({ ...s, [key]: val }));

  const addArtworkEntry = () =>
    setArtworks((s) => [
      ...s,
      {
        id: Date.now() + Math.random(),
        title: "",
        medium: "",
        dimensions: "",
        year: "",
        file: null,
        preview: null,
        uploadProgress: 0,
        uploadedUrl: null,
      },
    ]);

  const removeArtwork = (id: number) =>
    setArtworks((s) => s.filter((a) => a.id !== id));

  const updateArtworkField = (
    id: number,
    key: keyof ArtworkEntry,
    val: any
  ) => setArtworks((s) => s.map((a) => (a.id === id ? { ...a, [key]: val } : a)));

  const onFileSelected = (id: number, file: File | null) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    updateArtworkField(id, "file", file);
    updateArtworkField(id, "preview", preview);
  };

  const onProofSelected = (file: File | null) => {
    setProofFile(file);
    setProofPreview(file ? URL.createObjectURL(file) : null);
  };

  /* ---------- Validation ---------- */
  const validateBeforePayment = () => {
    if (!artist.fullName || !artist.email || !artist.country) {
      setError("Please fill artist details: Full name, email, country.");
      return false;
    }
    const anyMissing = artworks.some(
      (a) =>
        !a.title || !a.medium || !a.dimensions || !a.year || !a.file
    );
    if (anyMissing) {
      setError("Please fill all artwork details and upload an image for each artwork.");
      return false;
    }
    setError(null);
    return true;
  };

  /* ---------- Upload helpers ---------- */
  const uploadFileWithProgress = (
    file: File,
    path: string,
    onProgress?: (p: number) => void
  ): Promise<string> =>
    new Promise((resolve, reject) => {
      try {
        const r = storageRef(storage, path);
        const uploadTask = uploadBytesResumable(r, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(progress);
          },
          (err) => reject(err),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      } catch (err) {
        reject(err);
      }
    });

  const computeBatchProgress = () => {
    const vals = Object.values(progressRef.current);
    if (!vals.length) return 0;
    const sum = vals.reduce((a, b) => a + b, 0);
    return sum / vals.length;
  };

  /* ---------- Main flow ---------- */
  const onSubmitOpenPayment = () => {
    if (!validateBeforePayment()) return;
    setShowPaymentModal(true);
  };

  const onSelectPaymentAndContinue = (method: PaymentMethod) => {
    setSelectedPayment(method);
    setShowPaymentModal(false);
    setShowProofModal(true);
  };

  const onConfirmProofAndUpload = async () => {
    if (!proofFile) {
      setError("Please upload proof of payment screenshot.");
      return;
    }

    setError(null);
    setShowProofModal(false);
    setUploading(true);

    try {
      // Upload proof screenshot
      const proofPath = `payments_proofs/${artist.email}_${Date.now()}`;
      const proofUrl = await uploadFileWithProgress(proofFile, proofPath, (p) =>
        setBatchProgress(Math.round(p))
      );

      // Upload artworks
      progressRef.current = {};
      const uploadPromises = artworks.map((artwork, idx) => {
        return new Promise<{ id: number; url: string }>(async (resolve, reject) => {
          if (!artwork.file) return reject("Missing file");
          const path = `artworks/${artist.email}/${Date.now()}_${idx}_${artwork.file.name}`;
          progressRef.current[artwork.id] = 0;

          try {
            const url = await uploadFileWithProgress(artwork.file, path, (p) => {
              progressRef.current[artwork.id] = p;
              const overall = computeBatchProgress();
              setBatchProgress(overall);
              updateArtworkField(artwork.id, "uploadProgress", p);
            });
            updateArtworkField(artwork.id, "uploadedUrl", url);
            resolve({ id: artwork.id, url });
          } catch (err) {
            reject(err);
          }
        });
      });

      const uploadedResults = await Promise.all(uploadPromises);

      const artworksData = artworks.map((a) => ({
        title: a.title,
        medium: a.medium,
        dimensions: a.dimensions,
        year: a.year,
        imageUrl:
          a.uploadedUrl ||
          uploadedResults.find((r) => r.id === a.id)?.url ||
          null,
      }));

      const payload = {
        artist,
        artworks: artworksData,
        payment: {
          method: selectedPayment,
          proofUrl,
          amount: 100,
        },
        status: "pending",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "artworks"), payload);

      setUploading(false);
      setShowSuccess(true);
      setArtist({ fullName: "", email: "", country: "" });
      setArtworks([
        {
          id: Date.now(),
          title: "",
          medium: "",
          dimensions: "",
          year: "",
          file: null,
          preview: null,
          uploadProgress: 0,
          uploadedUrl: null,
        },
      ]);
      setSelectedPayment(null);
      setProofFile(null);
      setProofPreview(null);
      setBatchProgress(0);
    } catch (err) {
      console.error("upload flow error", err);
      setUploading(false);
      setError("Upload failed. Try again or contact support.");
    }
  };

   return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2>
          Certify your artworks with official Certificates of Authenticity,
          recognized internationally. Each certificate is $100 per artwork.
        </h2>
      </div>

      <div className={styles.container}>
        {/* Left: art visual */}
        <div className={styles.left}>
          <motion.div
            className={styles.artCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
         <Image
        src={art}
        alt="art preview"
        className={styles.artImg}
      />
            <div className={styles.artOverlay}>
              <p>Official Certification</p>
            </div>
          </motion.div>
        </div>

        {/* Right: form */}
        <div className={styles.right}>
          <motion.form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitOpenPayment();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className={styles.formTitle}>Certification Form</h3>

            <div className={styles.section}>
              <h4>Artist Details</h4>
              <div className={styles.row}>
                <label>
                  Full Name
                  <input
                    value={artist.fullName}
                    onChange={(e) => updateArtist("fullName", e.target.value)}
                    placeholder="Jane Doe"
                  />
                </label>
                <label>
                  Email
                  <input
                    value={artist.email}
                    onChange={(e) => updateArtist("email", e.target.value)}
                    placeholder="you@mail.com"
                    type="email"
                  />
                </label>
                <label>
                  Country
                  <input
                    value={artist.country}
                    onChange={(e) => updateArtist("country", e.target.value)}
                    placeholder="United states"
                  />
                </label>
              </div>
            </div>

            <div className={styles.section}>
              <h4>Artwork Details</h4>

              {artworks.map((a, idx) => (
                <motion.div
                  key={a.id}
                  className={styles.artworkItem}
                  layout
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className={styles.artworkFields}>
                    <label>
                      Title
                      <input
                        value={a.title}
                        onChange={(e) =>
                          updateArtworkField(a.id, "title", e.target.value)
                        }
                        placeholder="Artwork title"
                      />
                    </label>

                    <label>
                      Medium & Materials
                      <input
                        value={a.medium}
                        onChange={(e) =>
                          updateArtworkField(a.id, "medium", e.target.value)
                        }
                        placeholder="Oil on canvas"
                      />
                    </label>

                    <label>
                      Dimensions
                      <input
                        value={a.dimensions}
                        onChange={(e) =>
                          updateArtworkField(a.id, "dimensions", e.target.value)
                        }
                        placeholder="100 x 80 cm"
                      />
                    </label>

                    <label>
                      Year
                      <input
                        value={a.year}
                        onChange={(e) =>
                          updateArtworkField(a.id, "year", e.target.value)
                        }
                        placeholder="2025"
                      />
                    </label>

                    <label className={styles.fileLabel}>
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          onFileSelected(a.id, e.target.files?.[0] || null)
                        }
                      />
                    </label>
                  </div>

                  <div className={styles.previewArea}>
                    {a.preview ? (
                     <img
  src={a.preview}
  alt="preview"
  className={styles.previewImg}
/>
                    ) : (
                      <div className={styles.previewPlaceholder}>
                        <p>No image</p>
                      </div>
                    )}

                    <div className={styles.artworkActions}>
                      <button
                        type="button"
                        className={styles.smallBtn}
                        onClick={() => {
                          (["preview", "file"] as (keyof ArtworkEntry)[]).forEach(field => updateArtworkField(a.id, field, null));
                        }}
                      >
                        Remove Image
                      </button>
                      <button
                        type="button"
                        className={styles.smallBtnDanger}
                        onClick={() => removeArtwork(a.id)}
                        disabled={artworks.length === 1}
                        title={artworks.length === 1 ? "At least one" : "Remove"}
                      >
                        Remove Entry
                      </button>
                    </div>

                    {a.uploadProgress > 0 && a.uploadProgress < 100 && (
                      <ProgressBar value={a.uploadProgress} />
                    )}
                  </div>
                </motion.div>
              ))}

              <div className={styles.addRow}>
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={addArtworkEntry}
                >
                  + Add Another Artwork
                </button>
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button type="submit" className={styles.primaryBtn}>
                Submit 
              </button>
              {uploading && (
                <div className={styles.uploadingArea}>
                  <Spinner />
                  <div className={styles.batchProgressText}>
                    Uploading... {Math.round(batchProgress)}%
                  </div>
                </div>
              )}
            </div>
          </motion.form>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
            >
              <h4>Select a payment method (send $100)</h4>
              {loadingPayments ? (
                <Spinner />
              ) : paymentMethods.length ? (
                <div className={styles.paymentsList}>
                  {paymentMethods.map((m) => (
                    <div
                      key={m.id}
                      className={styles.paymentItem}
                      onClick={() => setSelectedPayment(m)}
                    >
                      <img
                        src={m.logo || ""}
                        alt={m.name}
                        className={styles.paymentLogo}
                      />
                      <div className={styles.paymentMeta}>
                        <strong>{m.name}</strong>
                        <div className={styles.address}>{m.address}</div>
                      </div>
                      <input
                        type="radio"
                        checked={selectedPayment?.id === m.id}
                        onChange={() => setSelectedPayment(m)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div>No payment methods found.</div>
              )}

              <div className={styles.modalActions}>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPayment(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={styles.primaryBtn}
                  onClick={() => {
                    if (!selectedPayment) {
                      setError("Choose a payment method first.");
                      return;
                    }
                    onSelectPaymentAndContinue(selectedPayment);
                  }}
                >
                  I've Paid
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proof of payment Modal */}
      <AnimatePresence>
        {showProofModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
            >
              <h4>Upload proof of payment</h4>
              <p>
                Send $100 to <strong>{selectedPayment?.name}</strong> at{" "}
                <strong>{selectedPayment?.address}</strong>, then upload a
                screenshot below.
              </p>

              <div className={styles.proofUploader}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onProofSelected(e.target.files?.[0] || null)}
                />
                {proofPreview && (
                  <img src={proofPreview} className={styles.proofPreview} />
                )}
              </div>

              <div className={styles.modalActions}>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => {
                    setShowProofModal(false);
                    setProofFile(null);
                    setProofPreview(null);
                  }}
                >
                  Cancel
                </button>
                <button className={styles.primaryBtn} onClick={onConfirmProofAndUpload}>
                  Upload & Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3>Uploaded successfully!!</h3>
              <p>
                Certification takes 2–3 business days for a batch of artworks.
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => setShowSuccess(false)}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Verification;
