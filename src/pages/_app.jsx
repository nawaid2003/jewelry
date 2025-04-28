import "../styles/global.css";
import styles from "../styles/global.module.scss";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MyApp({ Component, pageProps }) {
  return (
    <div className={styles.appContainer}>
      <Navbar />
      <main>
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  );
}
