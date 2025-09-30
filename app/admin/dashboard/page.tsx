"use client";

import { useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Payments from "../../../components/payments/payments";
import Verify from "../../../components/verify/verify";
import { db } from "../../../lib/firebase";
import { Toaster, toast } from "sonner";
import styles from "./page.module.css";

export default function Dashboard() {
  const [pinValues, setPinValues] = useState(["", "", "", "", "", ""]);
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [prevPin, setPrevPin] = useState("");
  const [newPin, setNewPin] = useState("");

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Fetch PIN from Firestore
  const fetchPin = async () => {
    const pinDoc = await getDoc(doc(db, "pin", "password"));
    if (pinDoc.exists()) {
      setStoredPin(pinDoc.data().value || null);
    } else {
      setStoredPin(null);
    }
  };

  useEffect(() => {
    fetchPin();
  }, []);

  // Handle input changes
  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newPinValues = [...pinValues];
    newPinValues[index] = value;
    setPinValues(newPinValues);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && value) checkPin(newPinValues.join(""));
  };

  const handleBackspace = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const newPinValues = [...pinValues];
      newPinValues[index] = "";
      setPinValues(newPinValues);
      if (index > 0) inputRefs.current[index - 1]?.focus();
    }
  };

  // Check PIN
  const checkPin = (enteredPin: string) => {
    const correctPin = storedPin || "000000";
    if (enteredPin === correctPin) {
      setUnlocked(true);
      toast.success("Unlocked!");
    } else {
      setPinValues(["", "", "", "", "", ""]);
      toast.error("Incorrect PIN");
      inputRefs.current[0]?.focus();
    }
  };

  // Reset PIN
  const handleResetPin = async () => {
    const currentPin = storedPin || "000000";
    if (prevPin !== currentPin) {
      toast.error("Previous PIN incorrect");
      return;
    }
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      toast.error("New PIN must be 6 digits");
      return;
    }

    await setDoc(doc(db, "pin", "password"), { value: newPin });
    setStoredPin(newPin);
    setPinValues(["", "", "", "", "", ""]);
    setPrevPin("");
    setNewPin("");
    setShowResetModal(false);
    setUnlocked(false);
    toast.success("PIN changed! Login with new PIN.");
  };

  if (!unlocked) {
    return (
      <div className={styles.lockScreen}>
        <Toaster richColors position="top-center" />
        <h2>Enter Admin PIN</h2>

        {/* Six digit PIN inputs */}
        <div className={styles.pinInputs}>
          {pinValues.map((val, i) => (
            <input
              key={i}
              type="password"
              maxLength={1}
              value={val}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleBackspace(i, e)}
              className={styles.pinBox}
            />
          ))}
        </div>

        <button
          className={styles.changePinBtn}
          onClick={() => setShowResetModal(true)}
        >
          Change PIN
        </button>

        {/* Modal for PIN change */}
        {showResetModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Change Admin PIN</h3>
              <input
                type="password"
                placeholder="Previous PIN"
                value={prevPin}
                onChange={(e) => setPrevPin(e.target.value.replace(/\D/g, ""))}
                className={styles.modalInput}
              />
              <input
                type="password"
                placeholder="New 6-digit PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                className={styles.modalInput}
              />
              <div className={styles.modalBtns}>
                <button onClick={handleResetPin} className={styles.modalBtn}>
                  Reset PIN
                </button>
                <button
                  onClick={() => setShowResetModal(false)}
                  className={styles.modalBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.dashboardInterface}>
      <Payments />
      <Verify />
    </div>
  );
}
