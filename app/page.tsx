import Navbar from "../components/navbar/navbar";
import Banner from "../components/banner/banner";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.homeInterface}>
      <Navbar />
      <Banner/>
    </div>
  );
}
