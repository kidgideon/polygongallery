import Navbar from "../components/navbar/navbar";
import Banner from "../components/banner/banner";
import Footer from "../components/footer/footer";
import Intro from "../components/intro/intro";
import Verification from "../components/verification/verification";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.homeInterface}>
      <Navbar />
      <Banner/>
      <Intro/>
      <Verification/>
      <Footer/>
    </div>
  );
}
