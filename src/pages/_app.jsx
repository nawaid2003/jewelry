import Head from "next/head"; // ✅ Add this line
import "../styles/global.css";
import "../styles/global.module.scss";
import { AuthProvider } from "../context/AuthContext";
import styles from "../styles/global.module.scss";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <title>Silver Lining </title> {/* ✅ This changes the tab name */}
        <meta
          name="description"
          content="Shop beautiful handmade silver jewelry at Silver Lining."
        />
        <link rel="icon" href="/favicon.ico" /> {/* ✅ Optional: add favicon */}
      </Head>

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
