"use client";

import { useEffect, useState } from "react";
import { db, storage } from "../../lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./payments.module.css";

interface Payment {
  id: string;
  name: string;
  logo?: string;
  address: string;
  payment: string;
}

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({ name: "", address: "", payment: "", logoFile: null as File | null });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "payments"));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
    setPayments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment option?")) return;
    await deleteDoc(doc(db, "payments", id));
    fetchPayments();
  };

  const handleEdit = (payment: Payment) => {
    setEditing(payment);
    setFormData({ name: payment.name, address: payment.address, payment: payment.payment, logoFile: null });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormData({ name: "", address: "", payment: "", logoFile: null });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    let logoUrl = editing?.logo || "";

    if (formData.logoFile) {
      const logoRef = ref(storage, `payments/${formData.logoFile.name}-${Date.now()}`);
      await uploadBytes(logoRef, formData.logoFile);
      logoUrl = await getDownloadURL(logoRef);
    }

    if (editing) {
      const docRef = doc(db, "payments", editing.id);
      await updateDoc(docRef, {
        name: formData.name,
        address: formData.address,
        payment: formData.payment,
        logo: logoUrl,
      });
    } else {
      await addDoc(collection(db, "payments"), {
        name: formData.name,
        address: formData.address,
        payment: formData.payment,
        logo: logoUrl,
      });
    }

    setSubmitLoading(false);
    setShowForm(false);
    fetchPayments();
  };

  return (
    <div className={styles.paymentInterface}>
      <div className={styles.header}>
        <h2>Payment Options</h2>
        <motion.button
          className={styles.addButton}
          onClick={handleAdd}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Add Payment
        </motion.button>
      </div>

      <AnimatePresence>
        {loading ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Loading payments...
          </motion.p>
        ) : payments.length === 0 ? (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <p>No payment options added yet.</p>
            <motion.button
              className={styles.addButton}
              onClick={handleAdd}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add First Payment
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className={styles.cards}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {payments.map(p => (
              <motion.div
                key={p.id}
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.logoArea}>
                  {p.logo && <img src={p.logo} alt={p.name} className={styles.logo} />}
                </div>

                <div className={styles.info}>
                  <p><strong>{p.name}</strong></p>
                  <p>{p.address}</p>
                  <p>{p.payment}</p>
                </div>
                <div className={styles.actions}>
                  <motion.button onClick={() => handleEdit(p)} title="Edit" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 0 1 3.182 3.182L7.5 19.214H4.5v-3l12.362-12.727z" />
                    </svg>
                  </motion.button>
                  <motion.button onClick={() => handleDelete(p.id)} title="Delete" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21a48.108 48.108 0 0 0-3.478-.397m-12 .562a48.11 48.11 0 0 1 3.478-.397M7.5 5v-.916c0-1.18.91-2.164 2.09-2.201a51.964 51.964 0 0 1 3.32 0c1.18.037 2.09 1.022 2.09 2.201V5m-7.5 0a48.667 48.667 0 0 0 7.5 0" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className={styles.popupOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.popup}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3>{editing ? "Edit Payment" : "Add Payment"}</h3>
              <form onSubmit={handleSubmit} className={styles.form}>
                <label>
                  Name
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Address
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Payment Network
                  <input
                    type="text"
                    value={formData.payment}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Logo (optional)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData(prev => ({ ...prev, logoFile: e.target.files?.[0] || null }))}
                  />
                </label>
                <div className={styles.formActions}>
                  <motion.button
                    type="submit"
                    className={styles.primaryBtn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {submitLoading ? "Loading..." : (editing ? "Update" : "Add")}
                  </motion.button>
                  <motion.button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => setShowForm(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payments;
