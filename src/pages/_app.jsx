import "../styles/global.css";
import "../styles/global.module.scss";
import { AuthProvider } from "../context/AuthContext";
import styles from "../styles/global.module.scss";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className={styles.appContainer}>
        <Navbar />
        <main>
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
